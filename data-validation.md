# Inspecting & Validating Data

The quality of your backtesting results is directly dependent on the quality of your historical data. Before running a strategy, it is essential to inspect your downloaded data to ensure it is complete and consistent. Gaps, duplicates, or other errors in your data can lead to misleading backtest results.

Stochastix provides a dedicated command-line tool, `stochastix:data:info`, to help you with this process.

::: tip UI Alternative
Data files can also be inspected and validated from the [**Data Validation modal in the UI**](./screenshots#data-validation).
:::

## The `data:info` Command

This command reads a `.stchx` binary data file and displays its metadata and a sample of its content. Its most powerful feature is the ability to perform a full consistency validation on the data.

### Command Signature

```bash
make sf c="stochastix:data:info <file-path> [options]"
```

### Argument

* **`file-path`**: The full path to the `.stchx` file you want to inspect.

### Example

```bash
make sf c="stochastix:data:info data/market/binance/ETH_USDT/1d.stchx"
```

## Inspecting File Contents

When run without any options, the command provides a quick overview of the file:

1.  **Header Metadata**: It displays the key information from the file's header, such as the `Symbol`, `Timeframe`, and the total `Number of Records` contained within the file.
2.  **Data Sample**: It shows the first 5 and last 5 records from the file. This is useful for a quick sanity check to ensure the timestamps and price ranges look correct.

```bash
📊 Stochastix STCHXBF1 File Information 📊
==========================================

 File: /app/data/market/okx/ETH_USDT/1d.stchx
 Size: 17,584 bytes

Header Metadata
---------------

 ------------------- ----------
  Magic Number        STCHXBF1
  Format Version      1
  Header Length       64
  Record Length       48
  Timestamp Format    1
  OHLCV Format        1
  Symbol              ETH/USDT
  Timeframe           1d
  Number of Records   365
 ------------------- ----------

Data Sample (Head & Tail)
-------------------------

 ------------ --------------------- ------------- ------------- ------------- ------------- ------------
  Timestamp    Date (UTC)            Open          High          Low           Close         Volume
 ------------ --------------------- ------------- ------------- ------------- ------------- ------------
  1672531200   2023-01-01 00:00:00   1,196.39000   1,204.70000   1,191.27000   1,200.43000   26,631.66
  1672617600   2023-01-02 00:00:00   1,200.27000   1,224.64000   1,192.90000   1,214.00000   75,316.11
  1672704000   2023-01-03 00:00:00   1,214.00000   1,220.00000   1,204.98000   1,214.51000   37,567.06
  1672790400   2023-01-04 00:00:00   1,214.51000   1,273.55000   1,212.73000   1,256.73000   175,177.68
  1672876800   2023-01-05 00:00:00   1,256.74000   1,259.98000   1,243.00000   1,251.34000   58,564.63
  ...          ...                   ...           ...           ...           ...           ...
  1703635200   2023-12-27 00:00:00   2,230.68000   2,392.94000   2,212.01000   2,378.35000   196,149.91
  1703721600   2023-12-28 00:00:00   2,378.36000   2,445.80000   2,335.27000   2,344.17000   223,327.62
  1703808000   2023-12-29 00:00:00   2,344.18000   2,385.27000   2,255.01000   2,299.15000   213,180.88
  1703894400   2023-12-30 00:00:00   2,299.14000   2,322.69000   2,267.72000   2,291.65000   97,952.85
  1703980800   2023-12-31 00:00:00   2,291.73000   2,321.39000   2,256.01000   2,282.13000   90,254.81
 ------------ --------------------- ------------- ------------- ------------- ------------- ------------
```

## Validating Data Consistency

The most important feature of the `data:info` command is the `--validate` flag. When this option is added, the tool will iterate through every single record in the file to check for common data quality issues.

```bash
make sf c="stochastix:data:info data/market/binance/ETH_USDT/1d.stchx --validate"
```

The validation checks for three types of problems:

1.  **Gaps**: The time difference between every consecutive record is checked. If it doesn't match the file's timeframe (e.g., 86,400 seconds for a `1d` file), it is flagged as a gap.
2.  **Duplicates**: The tool checks for any records that have the exact same timestamp as the one before it.
3.  **Out of Order**: The tool ensures that timestamps are always increasing. Any timestamp that is less than the previous one is flagged.

### Interpreting the Validation Output

* **If the data is clean**, you will see a "passed" status:

    ```bash
    🔍 Data Consistency Validation
    -----------------------------

     [OK] Data appears consistent.
    ```

* **If problems are found**, you will see a "failed" status with a detailed list of every issue, including the index of the problematic record:

    ```bash
    🔍 Data Consistency Validation
    -----------------------------

     [ERROR] Found 2 issue(s).

    Gaps:
    -----
     ! [WARNING] - At index 452: Diff: 172800s, Expected: 86400s

    Duplicates:
    -----------
     ! [WARNING] - At index 788: Timestamp 1698883200
    ```

::: tip Best Practice
Always run your downloaded data through the `--validate` check before using it for backtesting. Clean data is the bedrock of trustworthy results. If you find errors, it's best to re-download the data from the exchange or another source.
:::
