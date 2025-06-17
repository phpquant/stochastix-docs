# Plotting Custom Indicators

Once you've created a custom indicator, you'll want to see it on the results chart to analyze its behavior. Stochastix provides a clean way for an indicator to define its own default plotting configuration. This makes your custom indicators reusable and easy to visualize without adding complex plotting logic to your strategies.

This is achieved by implementing the `getPlotDefinition()` method in your indicator class.

## The `getPlotDefinition()` Method

By implementing this method from the `IndicatorInterface`, your custom indicator can return a `PlotDefinition` object that acts as a "template" for how it should be drawn on a chart.

The backtesting framework can then use this template automatically whenever you add the indicator to a strategy.

## Implementing the Plot for `RSIMovingAverage`

Let's continue with our `RSIMovingAverage` example and implement its `getPlotDefinition()` method. We want to display the RSI and its moving average in a separate pane below the price chart, with horizontal lines at the 70 and 30 levels.

```php
// In src/Indicator/RSIMovingAverage.php

use Stochastix\Domain\Plot\Annotation\HorizontalLine;
use Stochastix\Domain\Plot\Enum\HorizontalLineStyleEnum;
use Stochastix\Domain\Plot\PlotDefinition;
use Stochastix\Domain\Plot\Series\Line;

// ... inside the RSIMovingAverage class

public function getPlotDefinition(): ?PlotDefinition
{
    return new PlotDefinition(
        // This name is a default suggestion; it can be overridden by the strategy.
        name: 'RSI / MA',
        
        // 'false' renders the plot in a separate pane below the price chart.
        overlay: false,

        // Define the data series to draw.
        plots: [
            // Draw a line using the data from the 'rsi' series key.
            new Line(key: 'rsi', color: '#4e79a7'),
            
            // Draw a second line using data from the 'rsi_ma' series key.
            new Line(key: 'rsi_ma', color: '#f28e2b'),
        ],

        // Define static annotations for the plot pane.
        annotations: [
            new HorizontalLine(value: 70, style: HorizontalLineStyleEnum::Dashed),
            new HorizontalLine(value: 30, style: HorizontalLineStyleEnum::Dashed),
        ]
    );
}
```

**Key Concepts from this step:**
* **`plots` array**: We define one `Line` for each data series we stored in `$this->resultSeries`. The `key` in the `Line` constructor **must match** the key used in `calculateBatch()` (e.g., `'rsi'`, `'rsi_ma'`).
* **`annotations` array**: We add static `HorizontalLine` components to provide context for the overbought (70) and oversold (30) RSI levels.
* **`overlay: false`**: This is critical for oscillators like RSI, ensuring they get their own pane and don't get drawn on top of the price candles.

## Using the Self-Plotting Indicator

Now that our `RSIMovingAverage` indicator knows how to draw itself, using it in a strategy becomes incredibly simple.

To activate the automatic plotting, you provide a third argument to the `$this->addIndicator()` method: the desired name for the plot in the chart legend. When this third argument is present, the framework automatically calls your indicator's `getPlotDefinition()` method and uses the template it provides.

```php
// In your strategy's defineIndicators() method:

use App\Indicator\RSIMovingAverage;

protected function defineIndicators(): void
{
    $this->addIndicator(
        'my_rsi', // The key for the indicator instance
        new RSIMovingAverage(rsiPeriod: 14, maPeriod: 9),
        'RSI (14) with MA (9)' // This 3rd argument activates the plot!
    );
}
```

That's it! With this single line, you have added your custom indicator's logic to the backtest *and* configured it to be displayed beautifully on the results chart, with no plotting code needed in the strategy itself.
