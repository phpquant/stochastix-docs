# Plotting & Visualization

A picture is worth a thousand words, and in backtesting, a chart is worth a thousand data points. Stochastix includes a powerful plotting system that allows you to overlay your indicators directly onto the results chart, making it easy to debug your logic and analyze your strategy's behavior.

## How Plotting Works

You define your plots within the `defineIndicators()` method of your strategy, immediately after you define the indicator you wish to plot. The system works by linking a `PlotDefinition` to an indicator instance using the unique key you provided to the `$this->addIndicator()` method.

The primary method for this is `$this->definePlot()`.

## The `definePlot()` Method

This helper method, available in `AbstractStrategy`, allows you to configure how an indicator should be rendered.

```php
protected function definePlot(
    string $indicatorKey,
    string $name,
    bool $overlay,
    array $plots,
    array $annotations = []
): self
```

**Parameters:**

* `indicatorKey`: **Must match** the key you used in `$this->addIndicator()`. This tells Stochastix which indicator's data to use for this plot.
* `name`: A human-readable name that will appear in the chart's legend (e.g., "EMA (20)").
* `overlay`: A boolean.
    * `true`: The plot will be drawn on top of the main price (candlestick) chart. Use this for price-based indicators like Moving Averages or Bollinger Bands.
    * `false`: The plot will be rendered in a separate pane below the main chart. Use this for oscillators like RSI or MACD.
* `plots`: An array of plot components (like `Line` or `Histogram`) that define the series to be drawn from the indicator's data.
* `annotations`: An array of static plot components, like horizontal lines.

## Defining What to Plot

The `$plots` and `$annotations` arrays accept special plot component objects that describe what to draw.

### `Line`

Draws a simple line graph. This is the most common component.


* `key`: The specific data series from the indicator to plot. For simple indicators, this is almost always `'value'`. For multi-value indicators like MACD, this could be `'macd'` or `'signal'`.
* `color`: An optional hex or rgba color string.

```php
use Stochastix\Domain\Plot\Series\Line;

new Line(key: 'value', color: '#4e79a7')
```

### `Histogram`

Draws a histogram (bar chart), often used for MACD histograms or volume.


* `key`: The data series from the indicator to render as a histogram (e.g., `'hist'` for MACD).
* `color`: An optional hex or rgba color string.

```php
use Stochastix\Domain\Plot\Series\Histogram;

new Histogram(key: 'hist', color: 'rgba(178, 181, 190, 0.5)')
```

### `HorizontalLine` (Annotation)

Draws a static horizontal line across a plot pane. This is an annotation, not a data series plot.


* `value`: The y-axis value where the line should be drawn.
* `color`: An optional color string.
* `style`: The line style, from `HorizontalLineStyleEnum::Solid`, `Dashed`, or `Dotted`.

```php
use Stochastix\Domain\Plot\Annotation\HorizontalLine;
use Stochastix\Domain\Plot\Enum\HorizontalLineStyleEnum;

new HorizontalLine(value: 0, style: HorizontalLineStyleEnum::Dashed)
```

## Complete Examples

Here’s how you would use these components in your `defineIndicators()` method.

### Example 1: Plotting EMAs on the Price Chart

This example plots two EMAs directly on top of the price candles.

```php
protected function defineIndicators(): void
{
    $this
        // 1. Define the fast EMA indicator
        ->addIndicator(
            'ema_fast',
            new TALibIndicator(TALibFunctionEnum::Ema, ['timePeriod' => $this->emaFastPeriod])
        )
        // 2. Define the plot for the fast EMA
        ->definePlot(
            indicatorKey: 'ema_fast', // Link to the indicator above
            name: "EMA ({$this->emaFastPeriod})",
            overlay: true, // Draw on the main price chart
            plots: [
                new Line(key: 'value', color: '#4e79a7'), // Plot its 'value' series
            ]
        )
        // 3. Define the slow EMA indicator
        ->addIndicator(
            'ema_slow',
            new TALibIndicator(TALibFunctionEnum::Ema, ['timePeriod' => $this->emaSlowPeriod])
        )
        // 4. Define the plot for the slow EMA
        ->definePlot(
            indicatorKey: 'ema_slow',
            name: "EMA ({$this->emaSlowPeriod})",
            overlay: true,
            plots: [
                new Line(key: 'value', color: '#f28e2b'),
            ]
        );
}
```

### Example 2: Plotting MACD in a Separate Pane

This example, adapted from the `SampleStrategy`, shows how to plot the multi-value MACD indicator in its own pane below the price chart.

```php
protected function defineIndicators(): void
{
    $this
        // 1. Define the MACD indicator
        ->addIndicator(
            'macd',
            new TALibIndicator(TALibFunctionEnum::Macd, [
                'fastPeriod' => 12,
                'slowPeriod' => 26,
                'signalPeriod' => 9
            ])
        )
        // 2. Define the plot for the MACD
        ->definePlot(
            indicatorKey: 'macd', // Link to the indicator above
            name: 'MACD (12, 26, 9)',
            overlay: false, // Draw in a separate pane
            plots: [
                new Line(key: 'macd', color: '#2962FF'),
                new Line(key: 'signal', color: '#FF6D00'),
                new Histogram(key: 'hist', color: 'rgba(178, 181, 190, 0.5)'),
            ],
            annotations: [
                // Add a dashed line at the zero level for reference
                new HorizontalLine(value: 0, style: HorizontalLineStyleEnum::Dashed)
            ]
        );
}
```
