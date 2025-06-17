# Format Specification: Time-Series Data <Badge type="tip" text=".stchxi" /> <Badge type="tip" text=".stchxm" />

## 1. Overview and Purpose

After a backtest run, Stochastix saves time-aligned data series for indicators and performance metrics (like the equity curve) into specialized binary files. This is done to provide a compact, high-performance storage solution for the potentially large volume of data required for plotting and analysis, keeping it separate from the main JSON summary results.

* **`.stchxi`**: Stores indicator data series (e.g., EMA, MACD values).
* **`.stchxm`**: Stores performance metric series (e.g., Equity, Drawdown).

Both formats share the same underlying structure, with very minor differences noted below. All multi-byte numerical values are stored in **Big-Endian** (network byte order).

## 2. File Structure

The binary file is composed of four main sections:

1.  **Header Section:** A fixed-size block containing metadata about the file's contents.
2.  **Timestamp Block:** A single, contiguous block of all timestamps for which values were calculated. This serves as the master time index for all series in the file.
3.  **Series Directory:** A block of records defining each individual data series contained in the file.
4.  **Data Blocks:** A final section containing the actual values, with one contiguous block of data per series defined in the directory.

```
+---------------------------+
|      Header Section       | (64 bytes)
+---------------------------+
|     Timestamp Block       | (Timestamp Count * 8 bytes)
+---------------------------+
|      Series Directory     | (Series Count * 64 bytes)
+---------------------------+
| Data Block for Series 1   | (Timestamp Count * 8 bytes)
+---------------------------+
| ...                       |
+---------------------------+
| Data Block for Series N   | (Timestamp Count * 8 bytes)
+---------------------------+
```

## 3. Header Section Definition (Version 1)

The header is a fixed-size block of 64 bytes.

| Offset (Bytes) | Length (Bytes) | Field Name        | Data Type    | Description / Value for Version 1                             |
|:---------------|:---------------|:------------------|:-------------|:--------------------------------------------------------------|
| 0              | 8              | Magic Number      | ASCII String | `"STCHXI01"` (for Indicator files) or `"STCHXM01"` (for Metric files) |
| 8              | 2              | Format Version    | `uint16_t`   | `1`                                                           |
| 10             | 1              | Value Format Code | `uint8_t`    | `1` (Indicates: 8-byte IEEE 754 Double Precision, Big-Endian) |
| 11             | 1              | Padding Byte      | `uint8_t`    | Null byte for alignment.                                      |
| 12             | 4              | Series Count      | `uint32_t`   | The total number of unique data series in the file.         |
| 16             | 8              | Timestamp Count   | `uint64_t`   | The number of records/timestamps in each series.              |
| 24             | 40             | Reserved          | Bytes        | Set to null bytes (`\0`). Reserved for future use.            |

## 4. Timestamp Block Definition

This section starts immediately after the 64-byte header. It contains a single, unbroken sequence of `Timestamp Count` records. Each timestamp is an 8-byte `uint64_t` representing the Unix timestamp in seconds (UTC). This block acts as the time-axis for all data series that follow.

## 5. Series Directory Definition

This section follows the Timestamp Block. It contains `Series Count` records, each 64 bytes long, defining the properties of each data series stored in the file.

**Structure of a Single Series Directory Entry (64 bytes):**

| Offset within Record | Length (Bytes) | Field Name    | Data Type    | Description                                                                            |
|:---------------------|:---------------|:--------------|:-------------|:---------------------------------------------------------------------------------------|
| 0                    | 32             | Primary Key   | ASCII String | The main key. For `.stchxi` this is the **Indicator Key** (e.g., "ema_short"). For `.stchxm` this is the **Metric Key** (e.g., "equity"). Null-padded. |
| 32                   | 32             | Series Key    | ASCII String | The specific series from the entity (e.g., "value", "macd", "signal"). Null-padded. |

## 6. Data Blocks Definition

This section starts immediately after the Series Directory. It contains `Series Count` contiguous blocks of data. Each block contains `Timestamp Count` values, corresponding to one of the series defined in the directory. The order of the data blocks must match the order of the entries in the Series Directory.

For Version 1, each value is an 8-byte, Big-Endian `double`. A value of `NAN` (Not A Number) is used to represent null or non-existent data points for a given timestamp.
