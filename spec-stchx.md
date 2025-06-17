# Format Specification: OHLCV Data <Badge type="tip" text=".stchx" />

## 1. Overview and Purpose

This document specifies Version 1 of a binary file format ("STCHXBF1") designed for storing OHLCV (Open, High, Low, Close, Volume) time-series data. The primary use case for this format is within a custom financial backtesting framework, emphasizing efficient storage and fast data retrieval, especially for time-based ranges.

All multi-byte numerical values in this format are stored in **Big-Endian** (network byte order).

## 2. File Structure

The binary file is composed of two main sections:

1.  **Header Section:** A 64-byte block at the beginning of the file containing metadata about the data series.
2.  **Data Records Section:** A sequence of fixed-size (48-byte) data records, each representing one OHLCV data point.

```
+------------------------+
|     Header Section     | (64 bytes)
+------------------------+
| Data Record 1          | (48 bytes)
+------------------------+
| Data Record 2          | (48 bytes)
+------------------------+
| ...                    |
+------------------------+
| Data Record N          | (48 bytes)
+------------------------+
```

## 3. Header Section Definition (Version 1)

The header is a fixed-size block of 64 bytes.

| Offset (Bytes) | Length (Bytes) | Field Name             | Data Type    | Description / Value for Version 1                                            |
|:---------------|:---------------|:-----------------------|:-------------|:-----------------------------------------------------------------------------|
| 0              | 8              | Magic Number           | ASCII String | "STCHXBF1" (Identifies file as STCHX Binary Format v1)                       |
| 8              | 2              | Format Version         | `uint16_t`   | `1`                                                                          |
| 10             | 2              | Header Length          | `uint16_t`   | `64` (Total size of this header in bytes for v1)                             |
| 12             | 2              | Record Length          | `uint16_t`   | `48` (Size of one OHLCV data record in bytes for v1)                         |
| 14             | 1              | Timestamp Format Code  | `uint8_t`    | `1` (Indicates: 8-byte Unix Timestamp in seconds, Big-Endian `uint64_t`)     |
| 15             | 1              | OHLCV Data Format Code | `uint8_t`    | `1` (Indicates: 8-byte IEEE 754 Double Precision, Big-Endian, for O,H,L,C,V) |
| 16             | 8              | Number of Data Records | `uint64_t`   | Total count of OHLCV records in the file                                     |
| 24             | 16             | Symbol / Instrument    | ASCII String | e.g., "EURUSDT\0\0\0\0\0\0\0" (Null-padded if shorter than 16 bytes)         |
| 40             | 4              | Timeframe              | ASCII String | e.g., "M1\0\0" (Null-padded if shorter than 4 bytes)                         |
| 44             | 20             | Reserved               | Bytes        | Set to null bytes (`\0`). Reserved for future use.                           |

## 4. Data Records Section Definition (Version 1)

This section starts immediately after the 64-byte header. It contains a sequence of `Number of Data Records` entries. Each record is 48 bytes long.

**Crucial Assumption:** Data records **MUST** be sorted chronologically by the `Timestamp` field in ascending order.

**Structure of a Single Data Record (48 bytes):**

| Offset within Record (Bytes) | Length (Bytes) | Field Name  | Data Type  | Description                                     |
|:-----------------------------|:---------------|:------------|:-----------|:------------------------------------------------|
| 0                            | 8              | Timestamp   | `uint64_t` | Unix timestamp in seconds (UTC) since epoch.    |
| 8                            | 8              | Open Price  | `double`   | Opening price.                                  |
| 16                           | 8              | High Price  | `double`   | Highest price during the period.                |
| 24                           | 8              | Low Price   | `double`   | Lowest price during the period.                 |
| 32                           | 8              | Close Price | `double`   | Closing price.                                  |
| 40                           | 8              | Volume      | `double`   | Traded volume (using `double` for flexibility). |
