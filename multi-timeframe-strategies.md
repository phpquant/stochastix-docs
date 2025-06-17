# Multi-Timeframe Strategies

Analyzing a single timeframe can give you entry signals, but professional strategies often gain a significant edge by consulting higher timeframes to determine the overall market trend. This is known as Multi-Timeframe (MTF) Analysis.

Stochastix has first-class support for MTF analysis, allowing your strategy to seamlessly access data from different candle sizes within a single `onBar()` execution.

::: warning Data must be downloaded
Before running an MTF strategy, you **must** download the historical data for **every timeframe** you intend to use. If a secondary timeframe's data file is missing, the backtest will fail.

Please refer to the [**Downloading Market Data**](/data-downloading) guide for instructions.
:::

## 1. Requesting Timeframe Data

The first step is to inform the backtesting engine which timeframes your strategy requires. This is done using the `requiredMarketData` parameter in the `#[AsStrategy]` attribute.

Let's design a simple strategy that trades on a 1-hour (`H1`) chart but uses the 4-hour (`H4`) chart to confirm the trend.

```php
use Stochastix\Domain\Common\Enum\TimeframeEnum;
use Stochastix\Domain\Strategy\Attribute\AsStrategy;

#[AsStrategy(
    alias: 'mtf_rsi_trend',
    name: 'Multi-Timeframe RSI Trend',
    // The primary timeframe for the strategy
    timeframe: TimeframeEnum::H1,
    // An array of all timeframes the strategy needs access to.
    requiredMarketData: [
        TimeframeEnum::H1,
        TimeframeEnum::H4,
    ]
)]
class MtfRsiStrategy extends AbstractStrategy
{
    // ...
}
```

## 2. Accessing Timeframe Data in `onBar`

When you request secondary data, the `onBar()` method receives a `MultiTimeframeOhlcvSeries` object as its `$bars` parameter. This special object provides access to all requested timeframes.

### Accessing the Primary Timeframe

You access the primary timeframe's data (in this case, `H1`) directly via the object's properties:

```php
// Get the most recent close price from the primary H1 series
$h1_close = $bars->close[0]; 

// Get the previous open price from the primary H1 series
$h1_previous_open = $bars->open[1];
```

### Accessing a Secondary Timeframe

You access a secondary timeframe's data by treating the `$bars` object like an array, using the `TimeframeEnum` case as the key. This returns a complete `OhlcvSeries` object for that timeframe, or `null` if the data isn't available yet.

```php
public function onBar(MultiTimeframeOhlcvSeries $bars): void
{
    // Access the entire 4-hour OhlcvSeries object
    $h4_bars = $bars[TimeframeEnum::H4];

    // It's crucial to check if the data exists, as the higher timeframe
    // may not have a bar corresponding to the current primary bar.
    if ($h4_bars === null) {
        return;
    }

    // Now you can access the H4 data just like a normal series.
    // The engine ensures the data is correctly aligned in time.
    $h4_close = $h4_bars->close[0];
    $h4_high = $h4_bars->high[0];
    
    // ... your logic using both H1 and H4 data
}
```

## 3. A Complete Example

Let's build a full strategy that uses our custom `RSIMovingAverage` indicator on the 1H chart and a simple SMA on the 4H chart as a trend filter.

**The Logic:**

  * **Primary Timeframe (1H):** We will use the `RSIMovingAverage` indicator to find entry signals.
  * **Secondary Timeframe (4H):** We will use a 50-period SMA to determine the long-term trend.
  * **Entry Condition:** We will only enter a `long` position if the 1H RSI crosses above its moving average **AND** the current 1H price is above the 4H SMA(50).
  * **Exit Condition:** We will exit when the 1H RSI crosses back below its moving average.

Here is the full strategy code:

```php
<?php

namespace App\Strategy;

use App\Indicator\RSIMovingAverage;
use Stochastix\Domain\Common\Enum\DirectionEnum;
use Stochastix\Domain\Common\Enum\TimeframeEnum;
use Stochastix\Domain\Common\Enum\TALibFunctionEnum;
use Stochastix\Domain\Common\Model\MultiTimeframeOhlcvSeries;
use Stochastix\Domain\Indicator\Model\TALibIndicator;
use Stochastix\Domain\Order\Enum\OrderTypeEnum;
use Stochastix\Domain\Strategy\AbstractStrategy;
use Stochastix\Domain\Strategy\Attribute\AsStrategy;
use Stochastix\Domain\Strategy\Attribute\Input;

#[AsStrategy(
    alias: 'mtf_rsi_trend',
    name: 'Multi-Timeframe RSI Trend',
    timeframe: TimeframeEnum::H1,
    requiredMarketData: [TimeframeEnum::H1, TimeframeEnum::H4]
)]
class MtfRsiStrategy extends AbstractStrategy
{
    #[Input(description: 'RSI Period on the primary timeframe')]
    private int $rsiPeriod = 14;

    #[Input(description: 'MA Period for the RSI line')]
    private int $rsiMaPeriod = 9;

    #[Input(description: 'SMA Period for the higher timeframe trend filter')]
    private int $trendSmaPeriod = 50;

    protected function defineIndicators(): void
    {
        // Indicator for our primary (H1) timeframe
        $this->addIndicator(
            'h1_rsi_ma',
            new RSIMovingAverage($this->rsiPeriod, $this->rsiMaPeriod)
        );

        // Indicator for our secondary (H4) timeframe trend filter
        $this->addIndicator(
            'h4_trend_sma',
            new TALibIndicator(
                TALibFunctionEnum::Sma,
                ['timePeriod' => $this->trendSmaPeriod],
                sourceTimeframe: TimeframeEnum::H4 // Tell the indicator to use H4 data
            )
        );
    }

    public function onBar(MultiTimeframeOhlcvSeries $bars): void
    {
        // --- 1. Get indicator values ---
        $h1Rsi = $this->getIndicatorSeries('h1_rsi_ma', 'rsi');
        $h1RsiMa = $this->getIndicatorSeries('h1_rsi_ma', 'rsi_ma');
        $h4Sma = $this->getIndicatorSeries('h4_trend_sma');

        // --- 2. Check for missing data ---
        // The higher timeframe data or indicators might not have values yet.
        if ($h1Rsi[0] === null || $h1RsiMa[0] === null || $h4Sma[0] === null) {
            return;
        }

        // --- 3. Define the conditions ---
        $isBullishTrend = $bars->close[0] > $h4Sma[0];
        $isEntrySignal = $h1Rsi->crossesOver($h1RsiMa);
        $isExitSignal = $h1Rsi->crossesUnder($h1RsiMa);

        // --- 4. Execute trading logic ---
        if (!$this->isInPosition()) {
            // Only enter long if our H1 signal occurs during a H4 uptrend.
            if ($isEntrySignal && $isBullishTrend) {
                $this->entry(DirectionEnum::Long, OrderTypeEnum::Market, '0.1');
            }
        } else {
            if ($isExitSignal) {
                $this->exit('0.1');
            }
        }
    }
}
```
