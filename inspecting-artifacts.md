# Inspecting Backtest Artifacts

After a backtest completes, Stochastix saves the time-series data for your indicators and performance metrics into compact binary files. While the full technical specifications for these formats are available, the framework also provides simple command-line tools to quickly inspect the metadata and structure of these files without needing a binary viewer.

This is primarily useful for advanced debugging or for developers building custom tools on top of Stochastix's data.

## The Backtest Artifact Files

For each backtest run, two time-series data files are generated and stored in the `data/backtests/` directory alongside the main JSON result file:

* **`.stchxi`**: Contains the calculated values for every indicator used in the strategy (e.g., every EMA, RSI, or custom indicator value for every bar).
* **`.stchxm`**: Contains the calculated time-series performance metrics, such as the portfolio's `equity` curve and `drawdown` series for each bar.

## Inspecting Indicator Files (`.stchxi`)

To view the contents of an indicator data file, use the `stochastix:data:indicator-info` command (alias: `stx:data:ind-info`).

### Command Signature

The command takes a single argument: the path to the `.stchxi` file.

```bash
make sf c="stochastix:data:indicator-info <path-to-file>"
```

### Example Usage

```bash
make sf c="stochastix:data:indicator-info data/backtests/20250617-093352_sample_strategy_447393.stchxi"
```

### Understanding the Output

The command outputs two main sections:

1.  **Header Information**: General metadata about the file, including the format version, the total number of timestamps (`Timestamp Count`), and the total number of individual data series stored (`Series Count`).
2.  **Series Directory**: This is a crucial table listing every single data series in the file.
    * `Indicator Key`: The unique key you gave the indicator in your strategy (e.g., `'ema_fast'`).
    * `Series Key`: The specific value from that indicator (e.g., `'value'`, or `'macd'`, `'signal'` for multi-value indicators).

```bash
📊 Stochastix STCHXI File Inspector 📊
======================================

 File: data/backtests/20250617-093352_sample_strategy_447393.stchxi
 Size: 4,194,368 bytes

Header Information
------------------

 ------------------- -----------
  Magic Number        STCHXI01
  Format Version      1
  Value Format Code   1
  Timestamp Count     86,400
  Series Count        2
 ------------------- -----------

Series Directory
----------------

 --- --------------- -----------
  #   Indicator Key   Series Key
 --- --------------- -----------
  0   ema_fast        value
  1   ema_slow        value
 --- --------------- -----------

[OK] File metadata read successfully.
```

## Inspecting Metric Files (`.stchxm`)

To view the contents of a metric data file, use the `stochastix:data:metric-info` command (alias: `stx:data:metric-info`). Its usage and output are structurally identical to the indicator command.

### Example Usage

```bash
make sf c="stochastix:data:metric-info data/backtests/20250617-093352_sample_strategy_447393.stchxm"
```

### Understanding the Output

The only difference is in the "Series Directory".

* `Metric Key`: The key for the time-series metric (e.g., `'equity'`, `'drawdown'`).
* `Series Key`: The specific value from that metric, which is typically `'value'`.

```bash
📊 Stochastix STCHXM File Inspector 📊
======================================
...
Series Directory
----------------

 --- ------------ -----------
  #   Metric Key   Series Key
 --- ------------ -----------
  0   equity       value
  1   drawdown     value
  2   benchmark    value
  3   beta         value
  4   alpha        value
 --- ------------ -----------

[OK] File metadata read successfully.
```
