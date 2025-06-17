# Using Indicators

Indicators are the cornerstone of technical analysis, transforming raw price data into actionable insights. Stochastix is designed to make using a vast library of common indicators simple and efficient.

## The `TALibIndicator` Wrapper

The primary way to use technical indicators in Stochastix is through the `TALibIndicator` class. This class is a powerful and convenient wrapper around the standard **PHP `trader` PECL extension**, which itself is a binding for the widely-used **TA-Lib (Technical Analysis Library)** written in C.

This approach gives you access to dozens of battle-tested, high-performance indicators out of the box.

::: tip Learn More
For a complete list of all available functions and their required parameters, the official PHP documentation for the `trader` extension is the definitive resource.
**[PHP Trader Documentation](https://www.php.net/manual/en/book.trader.php)**
:::

## Defining an Indicator

All indicators must be defined within the `defineIndicators()` method of your strategy. This method is called once at the start of a backtest, before the bar-by-bar processing begins.

To add an indicator, you use the `$this->addIndicator()` helper method from the `AbstractStrategy` class.

```php
// In src/Strategy/MyEmaStrategy.php

use Stochastix\Domain\Common\Enum\TALibFunctionEnum;
use Stochastix\Domain\Indicator\Model\TALibIndicator;

// ... inside your strategy class

protected function defineIndicators(): void
{
    $this->addIndicator(
        'ema_fast', // A unique key to identify this indicator instance
        new TALibIndicator(
            TALibFunctionEnum::Ema,      // The trader function to call
            ['timePeriod' => $this->emaFastPeriod] // Parameters for the function
        )
    );
}
```
In this example:
1. We give our indicator a unique key, `'ema_fast'`, so we can access it later.
2. We instantiate `TALibIndicator`.
3. The first argument is an enum case from `TALibFunctionEnum`, which corresponds to a `trader_*` function (e.g., `trader_ema`).
4. The second argument is an associative array of parameters that will be passed to the `trader_ema` function. The key, `timePeriod`, matches the parameter name required by the underlying C library.

## Accessing Indicator Values

Once an indicator is defined, the backtesting engine automatically calculates its value for every bar. You can access these values in the `onBar()` method through the `$this->getIndicatorSeries()` helper. This method returns a [`Series`](/core-concepts.html#the-series) object.

```php
public function onBar(MultiTimeframeOhlcvSeries $bars): void
{
    // Get the entire series object for our indicator
    $fastEmaSeries = $this->getIndicatorSeries('ema_fast');

    // Access the current value (for the current bar)
    $currentEmaValue = $fastEmaSeries[0];
    
    // Access the previous bar's value
    $previousEmaValue = $fastEmaSeries[1];

    if ($currentEmaValue === null || $previousEmaValue === null) {
        // The indicator might not have enough data to calculate a value yet
        // (e.g., an EMA(20) needs at least 20 bars of data).
        return;
    }

    // Now you can use the values in your logic
    if ($bars->close[0] > $currentEmaValue) {
        // ... Price is above the fast EMA
    }
}
```

## Multi-Value Indicators (e.g., MACD, BBANDS)

Some indicators, like MACD or Bollinger Bands, don't just return a single line; they return multiple arrays of data (e.g., MACD line, signal line, and histogram). The `TALibIndicator` class handles this automatically.

For these indicators, the framework assigns a default key to each returned data series. For example, the `trader_macd` function returns three arrays, which Stochastix maps to the keys: `macd`, `signal`, and `hist`.

To access these individual series, you simply pass the specific series key as the second argument to `getIndicatorSeries()`.

```php
// In defineIndicators():
$this->addIndicator(
    'macd_main', // The key for the indicator group
    new TALibIndicator(TALibFunctionEnum::Macd, [
        'fastPeriod' => 12,
        'slowPeriod' => 26,
        'signalPeriod' => 9,
    ])
);


// In onBar():
// Get the individual series objects
$macdLine = $this->getIndicatorSeries('macd_main', 'macd');
$signalLine = $this->getIndicatorSeries('macd_main', 'signal');
$macdHist = $this->getIndicatorSeries('macd_main', 'hist');

// Now you can use their current and previous values
$isMacdCrossUp = $macdLine->crossesOver($signalLine);
$isHistogramPositive = $macdHist[0] > 0;

if ($isMacdCrossUp && $isHistogramPositive) {
    // ... A bullish MACD crossover occurred
}
```
