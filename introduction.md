# What's Stochastix?

Stochastix is a high-performance, open-source quantitative **backtesting framework** dedicated exclusively to **crypto-currencies trading**. Engineered in PHP and Symfony, it is designed to provide developers and quantitative analysts with a robust, precise, and extensible environment to build, test, and analyze algorithmic trading strategies.

The framework's primary mission is to enable rigorous, data-driven research by providing tools that ensure simulation realism, computational precision, and deep performance insight.

## The Core Principles

Trading strategy development requires rigorous analysis. Stochastix is founded on three fundamental principles that make this possible:

1.  **Realism:** A backtest is only as good as its simulation. Stochastix favors a realistic, event-driven approach that processes data bar-by-bar, handles complex order types natively, and manages portfolio state with precision.
2.  **Performance:** Quantitative analysis involves massive datasets. The framework is architected for speed and memory efficiency, from its custom binary data formats to its use of high-performance PHP extensions, ensuring that your research is not bottlenecked by I/O or processing time.
3.  **Developer experience:** A powerful tool should not be difficult to use. Built on modern PHP and the Symfony framework, Stochastix provides an intuitive, attribute-based system for strategy creation, clear separation of concerns, and a fully automatable command-line interface.

## Key Features at a Glance

  * **Event-driven backtesting engine:** Simulates trading on a bar-by-bar basis, providing a realistic environment for strategies that react to market changes as they happen.
  * **Advanced order management:** Native support for `Market`, `Limit`, and `Stop` orders, including automated intra-bar execution of Stop-Loss and Take-Profit levels, partial exits, and programmatic order cancellation.
  * **Multi-timeframe analysis:** Natively request and access secondary timeframes (e.g., 4-hour data within a 1-hour strategy). Data is automatically resampled and aligned with the primary series.
  * **Comprehensive performance analytics:** Go far beyond simple Profit/Loss. The framework automatically generates dozens of institutional-grade summary and time-series metrics, including Sharpe Ratio, Sortino Ratio, Calmar Ratio, CAGR, Max Drawdown, Alpha, and Beta.
  * **High-performance data formats:** Custom binary file formats (`.stchx`, `.stchxi`, `.stchxm`) for storing market data, indicators, and metrics, ensuring minimal storage footprint and maximum read performance.
  * **Integrated data downloader:** A built-in CLI command to fetch high-quality historical OHLCV data from major exchanges via the CCXT library.
  * **Asynchronous & real-time:** Leverages Symfony Messenger and Mercure to run backtests asynchronously while pushing live progress updates to the UI.

## Engineered for Performance

Stochastix is meticulously optimized to handle the demands of quantitative research.

### Optimized Data Storage: The Binary Formats

Text-based data formats like CSV are inefficient for backtesting. They are slow to parse and consume significant disk space. Stochastix solves this with its own family of binary formats:

  * **`.stchx`**: For OHLCV market data.
  * **`.stchxi`**: For indicator time-series data.
  * **`.stchxm`**: For performance metric time-series data (e.g., equity curve).

These formats provide several key advantages:

  * **Compact:** They use a fraction of the disk space of a comparable CSV file.
  * **Fast:** Data can be read directly into memory without any parsing overhead.
  * **Efficient:** The fixed-size record structure allows for extremely fast time-range lookups using binary search, meaning the engine only reads the data it needs.

### Efficient In-Memory Operations: The `ds` Extension

For operations that occur in memory, such as handling time-series data during a backtest, Stochastix uses the `ext-ds` PHP extension. The `Ds\Vector` object provides a more memory-efficient and performant alternative to standard PHP arrays for large, contiguous lists of numerical data, which is precisely what a time-series is.

## Designed for Developers

Power and performance are meaningless without a great developer experience (DX).

### Intuitive Strategy Creation

Creating a strategy is simple and clean. By extending `AbstractStrategy`, you gain access to a rich set of helper methods. Strategy metadata and configurable parameters are defined with simple PHP attributes, reducing boilerplate and keeping your code declarative and easy to read.

```php
#[AsStrategy(alias: 'my_strategy', name: 'My Awesome Strategy')]
class MyStrategy extends AbstractStrategy
{
    #[Input(description: 'The period for my indicator.')]
    private int $myPeriod = 20;

    public function onBar(OhlcvSeries $bars): void
    {
        // ... your logic here
    }
}
