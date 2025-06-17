# Multi-Series Custom Indicators

Many powerful indicators are not just a single line on a chart, but a combination of multiple data series. A classic example is the MACD, which consists of the MACD line, a signal line, and a histogram.

Stochastix allows your custom indicators to compute and expose multiple, distinct `Series` objects. This is achieved by using the `$this->resultSeries` property as an associative array.

## The `$resultSeries` Property

As we saw on the previous page, the final step in the `calculateBatch()` method is to store your calculated data in the `$this->resultSeries` property.

This property is an associative array where:
* **The key** is a `string` that uniquely identifies a specific data series (e.g., `'rsi'`, `'rsi_ma'`).
* **The value** is the final, padded `Series` object for that data.

By adding multiple key-value pairs to this array, your indicator effectively publishes multiple output series.

## A Practical Example: `RSIMovingAverage`

Let's revisit the `RSIMovingAverage` indicator we created. It naturally produces two distinct data series: the RSI line itself, and the moving average of that RSI line.

In the `calculateBatch()` method, we stored them with unique keys:

```php
// In src/Indicator/RSIMovingAverage.php

public function calculateBatch(Map $dataframes): void
{
    // ... (calculations for $rsiPadded and $maPadded)

    // Store the final, padded data as Series objects.
    // The keys used here are critical for accessing the data later.
    $this->resultSeries['rsi'] = new Series($rsiPadded);
    $this->resultSeries['rsi_ma'] = new Series($maPadded);
}
```

## Accessing Multi-Value Series in a Strategy

When you want to use this indicator in a strategy, you access each series by providing the specific key as the second argument to the `$this->getIndicatorSeries()` method.

```php
// In your strategy's onBar() method:

// Get the indicator instance we defined earlier.
$indicatorKey = 'my_custom_rsi';

// To get the raw RSI line, we use the 'rsi' key.
$rsiLine = $this->getIndicatorSeries($indicatorKey, 'rsi');

// To get the moving average line, we use the 'rsi_ma' key.
$rsiMaLine = $this->getIndicatorSeries($indicatorKey, 'rsi_ma');

// Now we can use both series in our logic.
if ($rsiLine->crossesOver($rsiMaLine)) {
    // A bullish signal has occurred.
    // ...
}
```

::: warning Important
If you do not provide the second argument to `$this->getIndicatorSeries()`, it will default to requesting a series with the key `'value'`. In the case of our `RSIMovingAverage` indicator, this would cause an error because we did not define a series with the key `'value'`. You must always use the explicit keys you defined in your indicator's `calculateBatch()` method.
:::
