# Anatomy of a Strategy

Every trading strategy in Stochastix is a PHP class. While you could implement the `StrategyInterface` directly, the recommended and most convenient approach is to extend the `Stochastix\Domain\Strategy\AbstractStrategy` class. This base class provides a structured lifecycle and a rich set of helper methods for interacting with the backtesting engine.

This page will break down the essential components and lifecycle of a standard strategy class.

## The `#[AsStrategy]` Attribute

For Stochastix to recognize your class as a runnable strategy, you must decorate it with the `#[AsStrategy]` PHP attribute. This attribute registers your strategy with the framework, making it available in the user interface and on the command line.

It takes the following parameters:

* `alias`: A unique, snake_case string used to identify the strategy on the CLI (e.g., `ema_crossover`).
* `name`: A human-readable name for display in the UI (e.g., "EMA Crossover").
* `description`: An optional, longer description of what the strategy does.

```php
<?php

namespace App\Strategy;

use Stochastix\Domain\Strategy\AbstractStrategy;
use Stochastix\Domain\Strategy\Attribute\AsStrategy;

#[AsStrategy(
    alias: 'ema_crossover',
    name: 'EMA Crossover Strategy',
    description: 'A simple strategy that trades on the crossover of two Exponential Moving Averages.'
)]
class MyEmaStrategy extends AbstractStrategy
{
    // ...
}
```

## Defining Inputs with `#[Input]`

To make your strategy flexible and configurable, you can expose parameters using the `#[Input]` attribute on class properties. Any property decorated with this attribute will automatically become a configurable input in the UI and an option on the CLI.

You can define a description and a default value for each input directly in the property declaration.

```php
use Stochastix\Domain\Strategy\Attribute\Input;

#[AsStrategy(alias: 'ema_crossover', name: 'EMA Crossover Strategy')]
class MyEmaStrategy extends AbstractStrategy
{
    #[Input(description: 'Period for the fast EMA', min: 1)]
    private int $emaFastPeriod = 12;

    #[Input(description: 'Period for the slow EMA', min: 1)]
    private int $emaSlowPeriod = 26;
    
    // ...
}
```

## The Strategy Lifecycle

When a backtest runs, the framework calls several methods on your strategy class in a specific order. Understanding this lifecycle is key to writing effective strategies.

### 1. `afterConfigured()`

This is an optional hook method that you can implement. It is called *after* all the `#[Input]` parameters have been resolved and set on your strategy object, but *before* the main initialization and indicator setup. Most strategies will not need this method, but it is available for advanced setup logic that depends on the final configuration values.

```php
protected function afterConfigured(): void
{
    // Optional: Perform actions after inputs are configured.
    // For example, validate that emaFastPeriod is less than emaSlowPeriod.
    if ($this->emaFastPeriod >= $this->emaSlowPeriod) {
        throw new \InvalidArgumentException('Fast EMA period must be less than Slow EMA period.');
    }
}
```

### 2. `defineIndicators()`

This is a required abstract method that you **must** implement. It is called once per symbol at the beginning of the backtest. Its sole purpose is to define all the indicators your strategy will need for its calculations.

This is where you will use the `$this->addIndicator()` helper method.

```php
use Stochastix\Domain\Common\Enum\TALibFunctionEnum;
use Stochastix\Domain\Indicator\Model\TALibIndicator;

// ... inside your strategy class

protected function defineIndicators(): void
{
    $this
      ->addIndicator(
          'ema_fast',
          new TALibIndicator(TALibFunctionEnum::Ema, ['timePeriod' => $this->emaFastPeriod])
      )
      ->addIndicator(
          'ema_slow',
          new TALibIndicator(TALibFunctionEnum::Ema, ['timePeriod' => $this->emaSlowPeriod])
      );
}
```

### 3. `onBar()`

This abstract method is the heart of your strategy and **must** be implemented. It is called for every single candle (or "bar") in the dataset, from start to finish.

All of your core trading logic resides here:
* Accessing indicator values for the current bar.
* Checking for entry or exit conditions.
* Placing new orders.

```php
use Stochastix\Domain\Common\Model\MultiTimeframeOhlcvSeries;

// ... inside your strategy class

public function onBar(MultiTimeframeOhlcvSeries $bars): void
{
    $fastEma = $this->getIndicatorSeries('ema_fast');
    $slowEma = $this->getIndicatorSeries('ema_slow');

    // Check for a long entry signal
    if ($fastEma->crossesOver($slowEma)) {
        // ... place a long order
    }
    
    // Check for a short entry signal
    if ($fastEma->crossesUnder($slowEma)) {
        // ... place a short order
    }
}
```
