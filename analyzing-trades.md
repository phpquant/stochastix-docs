# Trade Analysis with Tags

A simple "Total Profit/Loss" number doesn't tell you *why* your strategy is performing the way it is. A profitable strategy might have one highly successful entry condition and one that consistently loses money. A losing strategy might be dragged down by a stop-loss that is too tight.

To solve this, Stochastix includes a powerful **Tagging** system. You can attach one or more string "tags" to every entry and exit signal. The backtesting engine then aggregates performance metrics for each tag, allowing you to perform detailed performance attribution.

## How to Tag Your Trades

The `$this->entry()` and `$this->exit()` methods in your `AbstractStrategy` both accept an optional final parameter: `enterTags` and `exitTags`, respectively. This parameter can be a single string or an array of strings.

Let's look at a practical example. Imagine a strategy that can enter long for two reasons: an EMA crossover or an oversold RSI. It can exit for three reasons: an opposite EMA cross (the main exit signal), a take-profit level, or a stop-loss.

```php
// --- In onBar() ---

// Condition 1: EMA Crossover Entry
if ($emaFast->crossesOver($emaSlow)) {
    $this->entry(
        direction: DirectionEnum::Long,
        orderType: OrderTypeEnum::Market,
        quantity: '0.5',
        enterTags: 'ema_cross' // Tagging the entry reason
    );
}

// Condition 2: RSI Oversold Entry
if ($rsi[0] < 30 && $rsi[1] >= 30) {
    $this->entry(
        direction: DirectionEnum::Long,
        orderType: OrderTypeEnum::Market,
        quantity: '0.5',
        enterTags: ['rsi_oversold', 'mean_reversion_signal'] // Using multiple tags
    );
}


// --- Exit Logic ---
$openPosition = $this->orderManager->getPortfolioManager()->getOpenPosition($this->context->getCurrentSymbol());
if ($openPosition) {
    // Exit Condition 1: Main Signal (EMA cross down)
    if ($emaFast->crossesUnder($emaSlow)) {
        $this->exit($openPosition->quantity, exitTags: 'exit_signal_cross');
    }
    
    // Exit Condition 2: Stop-Loss (logic handled elsewhere, just showing the tag)
    // For example, a trailing stop might be hit.
    if ($shouldExitForStopLoss) {
        $this->exit($openPosition->quantity, exitTags: 'stop_loss');
    }
}
```

## Analyzing Tag Performance

After the backtest is complete, the `statistics` object in the results file will contain two special sections: `enterTagStats` and `exitTagStats`.

These sections provide a complete performance breakdown for each tag you used.

**Example `enterTagStats` from a results file:**

```json
"enterTagStats": [
    {
        "label": "ema_cross",
        "trades": 52,
        "totalProfit": 1850.75,
        "wins": 30,
        "losses": 22
    },
    {
        "label": "rsi_oversold",
        "trades": 15,
        "totalProfit": -400.25,
        "wins": 4,
        "losses": 11
    }
]
```

### Answering Key Questions with Tags

This data allows you to answer critical questions about your strategy's logic:

* **"Which of my entry signals is actually profitable?"**
    *In the example above, trades entered because of `"ema_cross"` were highly profitable (`+1850.75`), while trades entered because of `"rsi_oversold"` were a net loss (`-400.25`). This tells you to focus on improving or removing the RSI entry condition.*

* **"Is my stop-loss strategy helping or hurting?"**
    *By analyzing the `exitTagStats` for your `'stop_loss'` tag, you can see the total P&L of all trades that were closed by it. If the total loss from stop-outs is greater than the profits preserved, your stop-loss might be too tight or poorly placed.*

* **"Which exit condition performs best?"**
    *You can compare the `averageProfitPercentage` and `totalProfit` for trades tagged with `'take_profit'` versus those with `'exit_signal_cross'` to see which exit logic captures more profit.*

### A Note on Multiple Tags

If a single trade has multiple tags (e.g., `['rsi_oversold', 'mean_reversion_signal']`), its profit and loss will be included in the statistics for **both** the `'rsi_oversold'` tag and the `'mean_reversion_signal'` tag. This is important to remember when analyzing the data, as the sum of `totalProfit` across all tags may not equal the overall total profit of the strategy if trades are multi-tagged.
