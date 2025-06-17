# Understanding the Results

When a backtest finishes running on the command line, it prints a comprehensive summary directly to your console. This summary is designed to give you an immediate, high-level overview of your strategy's performance, followed by a detailed log of its activity.

::: tip UI Alternative
While this guide details the CLI output, all of these results are presented in a rich, interactive format on the [**Backtest Results page in the UI**](./screenshots#backtest-results).
:::

## Sample Command-Line Output

Here is a sample output from a completed backtest run, which we will break down in the following sections.

```bash
➜ make sf c='stochastix:backtesting sample_strategy -t 5m'

🚀 Stochastix Backtester Initializing: sample_strategy 🚀
=========================================================

 Resolving configuration...
 Configuration resolved.

Final Backtest Configuration
----------------------------

 ---------------------- -----------------------------
  Strategy Alias         sample_strategy
  Strategy Class         App\Strategy\SampleStrategy
  Symbols                ETH/USDT
  Timeframe              5m
  Start Date             Full History (Start)
  End Date               Full History (End)
  Initial Capital        10000.00
  Stake Amount           2%
  Exchange               okx
 ---------------------- -----------------------------
  Strategy Inputs
    emaFastPeriod        12
    emaSlowPeriod        26
    stopLossPercentage   0.02
    stakeAmount          0.02
 ---------------------- -----------------------------

Starting Backtest Run...
------------------------

 ! [NOTE] Generated Run ID: 20250617-093352_sample_strategy_447393

Backtest Performance Summary
----------------------------

 -------------------- ----------
  Initial Capital      10000.00
  Final Capital        9895.98
  Total Net Profit     -104.02
  Total Net Profit %   -1.04%
 -------------------- ----------
  Total Trades         56
  Profit Factor        0.20
 -------------------- ----------
  Sharpe Ratio         -0.643
  Max Drawdown         1.18%
 -------------------- ----------

Closed Trades Log
-----------------

 ---- ---------- ------ ----------- ---------- --------------------- --------------------- ---------- -------
  #    Symbol     Dir    Enter Tag   Exit Tag   Entry Time            Exit Time             Qty        P&L
 ---- ---------- ------ ----------- ---------- --------------------- --------------------- ---------- -------
  1    ETH/USDT   Long                         2025-05-13 04:45:00   2025-05-13 09:00:00   0.081666   -1.31
  2    ETH/USDT   Long                         2025-05-13 09:05:00   2025-05-13 23:15:00   0.081193   15.62
  3    ETH/USDT   Long                         2025-05-14 00:25:00   2025-05-14 02:05:00   0.074486   -4.49
 ...  ...        ...    ...         ...        ...                   ...                   ...        ...
  56   ETH/USDT   Long                         2025-05-23 09:15:00   2025-05-23 10:30:00   0.074020   -2.72
 ---- ---------- ------ ----------- ---------- --------------------- --------------------- ---------- -------


📊 Backtest finished in: 364.90 ms / Memory usage: 26.00 MB


 [OK] Backtest for "sample_strategy" finished successfully.

```

## The Performance Summary

The first section is a definition list that highlights the most important, top-level performance metrics for the entire backtest.

* **Initial / Final Capital**: The starting and ending value of your portfolio. The final capital includes all realized profits from closed trades plus the unrealized value of any positions still open at the end of the test.
* **Total Net Profit**: The absolute difference between the final and initial capital, in your stake currency.
* **Total Net Profit %**: The total net profit expressed as a percentage of the initial capital.
* **Total Trades**: The total number of trades that were opened and closed during the backtest. In the example, you see there's a discrepancy with "56" in the table and "0" in the summary. This indicates a minor bug in the summary calculation that needs to be addressed.
* **Profit Factor**: A measure of profitability, calculated as Gross Profit divided by Gross Loss. A value greater than 1.0 indicates a profitable system. A value of 2.0, for example, means the strategy made twice as much money on its winning trades as it lost on its losing trades.
* **Sharpe Ratio**: A common institutional metric for calculating risk-adjusted return. It measures the average return earned in excess of a risk-free rate per unit of volatility. A higher Sharpe Ratio is generally better.
* **Max Drawdown**: The largest peak-to-trough decline in your portfolio's value, expressed as a percentage. This is a key indicator of risk and represents the worst-case loss an investor would have experienced had they invested at a peak.

## The Closed Trades Log

This table provides a detailed, trade-by-trade breakdown of the backtest.

* **`#`**: A sequential number for each trade.
* **`Symbol`**: The symbol that was traded (e.g., "BTC/USDT").
* **`Dir`**: The direction of the trade: `Long` or `Short`.
* **`Enter Tag` / `Exit Tag`**: Any custom tags you assigned when calling `$this->entry()` or `$this->exit()`. This is extremely useful for performance attribution.
* **`Entry Time` / `Exit Time`**: The timestamps when the position was opened and closed.
* **`Qty`**: The quantity of the asset that was traded.
* **`P&L`**: The final Profit or Loss for that specific trade, net of any commissions.

## The Open Positions Log

This section only appears if your strategy was still holding positions when the backtest ended. It did not appear in the sample above because all positions were closed.

* **`Symbol`**, **`Dir`**, **`Entry Time`**, **`Qty`**, **`Entry Price`**: These describe the details of the position when it was opened.
* **`Current Price`**: The closing price of the very last bar in the backtest.
* **`Unrealized P&L`**: The profit or loss the position would have if it were closed at the `Current Price`. This amount is included in the `Final Capital` calculation in the summary section.
