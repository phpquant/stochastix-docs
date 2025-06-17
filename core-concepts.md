# Core Concepts

To effectively use Stochastix, it's important to understand its main architectural components. These components are designed to be modular and intuitive, allowing you to focus on logic rather than boilerplate.

## The Strategy

The **Strategy** is the brain of your trading system. It's a PHP class where you define your logic for analyzing market data and making trading decisions. Stochastix automatically discovers any strategy class that implements the `StrategyInterface` and is decorated with the `#[AsStrategy]` attribute.

The easiest way to create a strategy is by extending `AbstractStrategy`, which provides a rich set of helper methods.

A strategy has a simple lifecycle:
1.  **`afterConfigured()`**: This method is called once after the strategy configuration, and before the backtest run, this is where you prepare extra logic or resources needed for the backtest.
1.  **`defineIndicators()`**: Called after configuration, this is where you set up your indicators for the backtest run.
2.  **`onBar()`**: This is the core method, executed for every single bar (e.g., every hour for a '1h' timeframe) of data in your backtest. All of your primary trading logic, like checking indicator values and placing orders, will live here.

```php
#[AsStrategy(alias: 'my_strategy', name: 'My Awesome Strategy')]
class MyStrategy extends AbstractStrategy
{
    #[Input(description: 'The period for my indicator.')]
    private int $myPeriod = 20;

    protected function defineIndicators(): void
    {
        // Setup indicators here
    }

    public function onBar(MultiTimeframeOhlcvSeries $bars): void
    {
        // Your trading logic here
    }
}
```

## The Series

A **Series** is an object representing a time-ordered sequence of data points, like the closing price of a stock or the value of an indicator. The most important feature of a Series is its chronological array-like access:
* `$series[0]` always returns the **current** value (for the bar being processed in `onBar`).
* `$series[1]` returns the **previous** value.
* `$series[2]` returns the value before that, and so on.

This makes it easy to compare current and historical data, for example: `if ($rsi[0] > 70 && $rsi[1] <= 70) { ... }`.

The `onBar` method of your strategy receives a `MultiTimeframeOhlcvSeries` object, which contains multiple `Series` for the primary timeframe (e.g., `$bars->close`, `$bars->high`) and can also hold `OhlcvSeries` for other timeframes.

## The Indicator

An **Indicator** is a component that calculates a new `Series` of data from one or more existing `Series`. For example, a Simple Moving Average (SMA) indicator takes the `close` price series and a time period as input and produces a new `Series` of SMA values.

Stochastix provides a powerful `TALibIndicator` that acts as a wrapper for the vast majority of indicators available in the `trader` PHP extension. You will typically define all your indicators within the `defineIndicators()` method of your strategy.

```php
// In your strategy's defineIndicators() method:
$this->addIndicator(
    'ema_fast',
    new TALibIndicator(TALibFunctionEnum::Ema, ['timePeriod' => 12])
);

// Then, in onBar(), you can access its calculated values:
$fastEmaSeries = $this->getIndicatorSeries('ema_fast');
$currentEmaValue = $fastEmaSeries[0];
```

## The Context

The **Strategy Context** is a central object that acts as the bridge between your strategy and the backtesting engine's other systems. It is passed to your strategy during initialization and is accessible within `AbstractStrategy` via `$this->context`.

The context provides access to the core managers:

### The Order Manager

Accessed via `$this->orderManager` in an `AbstractStrategy`, the **Order Manager** is your interface for all trade actions. Its primary role is to queue and process order "signals". When you call `$this->entry(...)` or `$this->exit(...)`, you are not executing a trade directly; you are creating an `OrderSignal` and sending it to the Order Manager to be executed on the next bar's open price.

It is also responsible for managing a book of pending orders, such as Limit and Stop orders, checking their trigger conditions on every bar.

### The Portfolio Manager

Accessed via `$this->orderManager->getPortfolioManager()`, the **Portfolio Manager** is responsible for tracking the financial state of your backtest. It knows about your initial capital, available cash, currently open positions, and the log of all closed trades. When the Order Manager executes a trade, the result is passed to the Portfolio Manager, which then updates your cash and position status accordingly.
