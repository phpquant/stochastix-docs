# Creating a Custom Indicator

While Stochastix provides a powerful `TALibIndicator` wrapper that covers dozens of standard indicators, you may eventually need to create your own. You might do this to:
* Implement a proprietary indicator that doesn't exist in TA-Lib.
* Create a composite indicator that combines the logic of several others.
* Perform custom mathematical transformations on existing indicator data.

This guide will walk you through creating a new custom indicator from scratch. We will build a simple but useful indicator called `RSIMovingAverage`, which calculates the Relative Strength Index (RSI) and then calculates a Simple Moving Average (SMA) of the RSI line itself.

## The Core Structure

Every indicator in Stochastix must implement the `IndicatorInterface`. However, the easiest way to start is by extending the `AbstractIndicator` base class, which provides some helpful boilerplate.

Custom indicators should be placed in the `src/Indicator/` directory of your project as convention, although it's not mandatory.

## Building the `RSIMovingAverage` Indicator

### Step 1: Create the Class File

First, create a new file at `src/Indicator/RSIMovingAverage.php`.

The basic structure will include a constructor to accept parameters (like the RSI and SMA periods) and the required `calculateBatch()` method.

```php
<?php

namespace App\Indicator;

use Ds\Map;
use Stochastix\Domain\Common\Enum\AppliedPriceEnum;
use Stochastix\Domain\Indicator\Model\AbstractIndicator;

final class RSIMovingAverage extends AbstractIndicator
{
    public function __construct(
        private readonly int $rsiPeriod,
        private readonly int $maPeriod,
        private readonly AppliedPriceEnum $source = AppliedPriceEnum::Close
    ) {
    }

    public function calculateBatch(Map $dataframes): void
    {
        // Calculation logic will go here
    }
}
```

### Step 2: Implement the `calculateBatch()` Method

This method is the heart of your indicator. It receives all the market data and is responsible for performing calculations and storing the results.

```php
// Inside the RSIMovingAverage class

use Ds\Map;
use Stochastix\Domain\Common\Model\Series;

public function calculateBatch(Map $dataframes): void
{
    // 1. Get the source price series (e.g., close prices) from the primary dataframe.
    $sourceSeries = $dataframes->get('primary')[$this->source->value];

    if ($sourceSeries->isEmpty()) {
        return; // Not enough data to calculate.
    }

    $inputData = $sourceSeries->toArray();
    $inputCount = count($inputData);

    // 2. Calculate the RSI.
    // The result is an array shorter than the input due to the warmup period.
    $rsiResult = trader_rsi($inputData, $this->rsiPeriod);
    if ($rsiResult === false) {
        return; // Calculation failed.
    }
    
    // We must pad the result with nulls to match the original input count for time alignment.
    $rsiPadded = $this->createPaddedArray($rsiResult, $inputCount);

    // 3. Calculate the SMA of the RSI.
    // Note: We use the *padded* RSI data as input here. trader_* functions can handle nulls.
    $maResult = trader_sma($rsiPadded, $this->maPeriod);
    if ($maResult === false) {
        return;
    }
    $maPadded = $this->createPaddedArray($maResult, $inputCount);

    // 4. Store the final, padded data as Series objects in the resultSeries property.
    // The keys 'rsi' and 'rsi_ma' are how we will access them later.
    $this->resultSeries['rsi'] = new Series($rsiPadded);
    $this->resultSeries['rsi_ma'] = new Series($maPadded);
}

/**
 * Creates a new array from a trader function result, padding it with nulls
 * at the beginning to match the original input data count.
 */
private function createPaddedArray(array|false $traderResult, int $expectedCount): array
{
    if ($traderResult === false) {
        return array_fill(0, $expectedCount, null);
    }

    $outputCount = count($traderResult);
    $paddingCount = $expectedCount - $outputCount;

    return ($paddingCount > 0)
        ? array_merge(array_fill(0, $paddingCount, null), array_values($traderResult))
        : array_values($traderResult);
}
```
**Key Concepts from this step:**

* **Warm-up Periods**: `trader` functions return shorter arrays than their input because they need a "warm-up" period (e.g., an SMA(20) can't produce a value until it has 20 data points).
* **Padding**: To ensure correct time alignment, we must pad the start of the result arrays with `null`s to match the count of the original source data. The `createPaddedArray` helper function handles this.
* **Storing Results**: The final, correctly-sized arrays are wrapped in `Series` objects and stored in the `$this->resultSeries` property. This makes them available to your strategy.

### Step 3: Using the Custom Indicator

Now your custom indicator is complete and can be used in any strategy just like the built-in `TALibIndicator`.

In your strategy's `defineIndicators()` method:

```php
// In a strategy file, e.g., src/Strategy/MyCustomRsiStrategy.php

use App\Indicator\RSIMovingAverage; // Import your new class

// ...

protected function defineIndicators(): void
{
    $this->addIndicator(
        'my_rsi', // A unique key for this indicator instance
        new RSIMovingAverage(rsiPeriod: 14, maPeriod: 9)
    );
}
```

And in your `onBar()` method, you can access its outputs:

```php
public function onBar(MultiTimeframeOhlcvSeries $bars): void
{
    // Access the 'rsi' series from your custom indicator
    $rsiLine = $this->getIndicatorSeries('my_rsi', 'rsi');
    
    // Access the 'rsi_ma' series
    $rsiMaLine = $this->getIndicatorSeries('my_rsi', 'rsi_ma');

    // Example logic
    if ($rsiLine->crossesOver($rsiMaLine)) {
        // ... RSI has crossed above its moving average
    }
}
```
