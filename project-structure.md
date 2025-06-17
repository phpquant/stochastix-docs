# Project Structure

Stochastix is built upon the robust and modular foundation of the Symfony framework. While a deep knowledge of Symfony is not required to write basic strategies, understanding the layout of the project will help you unlock the full potential of the framework.

## Key Directories

While a full Symfony application has many directories, only a few are critical for the day-to-day work of a strategy developer.

### `src/Strategy/`

This is the most important directory for you as a strategist.

* **Purpose:** This is where you will create, store, and manage all your custom trading strategy classes.
* **Discovery:** Stochastix automatically discovers any PHP class in this directory that implements the `StrategyInterface` and is decorated with the `#[AsStrategy]` attribute. This makes them immediately available in the UI and via the CLI without any extra configuration.
* **Best Practice:** We recommend extending the `AbstractStrategy` class, which provides convenient helper methods for placing orders, accessing indicators, and managing state.

### `src/Indicator/`

* **Purpose:** This directory is intended for custom indicator logic if you need to create indicators that are not available in the standard TA-Lib library.
* **Extensibility:** While Stochastix provides a powerful `TALibIndicator` that covers dozens of common indicators, the system is fully extensible. You can create your own indicator logic by creating a new class that implements the `IndicatorInterface`.

:::info A Note on Directory Structure
The `src/Strategy` and `src/Indicator` directory names are recommended conventions, but they are not technically enforced by the framework.

Stochastix leverages Symfony's service autodiscovery, which scans the entire `src/` directory for classes that implement a specific interface (like `StrategyInterface`) and automatically registers them. This means you are free to organize your strategies and indicators in any sub-directory structure you prefer.

For example, you could place your strategies in `src/MyStrategies/Volatility/` and Stochastix would find them without any extra configuration. However, following the recommended convention is good practice for maintaining a clear and predictable project structure.
:::

### `data/`
This directory is not part of the source code but is generated in your project root. It's critical for the operation of the framework.

* `data/market/`: Stores all downloaded OHLCV data in the efficient `.stchx` binary format.
* `data/backtests/`: Stores the output of every backtest run, including the summary JSON file and the `.stchxi` and `.stchxm` binary files for charts.
* `data/queue_dev.db`: This SQLite database is used by Symfony Messenger to manage the queue of backtests and data processing tasks. It is automatically created and managed by the framework.

## Configuration

### Global Defaults (`config/packages/stochastix.yaml`)

This is the central configuration file for the Stochastix bundle. It allows you to define global default values for all backtests, such as:
* `initial_capital`
* `timeframe`
* `symbols`
* `commission` model and rate

Any parameter defined here can be overridden for a specific run via the API or CLI options.

## Core Symfony Components

Stochastix leverages powerful Symfony components to handle complex tasks like asynchronous processing and real-time updates.

### Messenger: Asynchronous Backtesting

:::info
**Role:** Prevents API timeouts and enables long-running backtests.
:::

When you launch a backtest from the UI or API, the request is completed almost instantly. This is because Stochastix does not run the backtest during the web request itself.

Instead, the `LaunchBacktestAction` controller dispatches a `RunBacktestMessage` onto a message bus. A separate worker process, managed by Symfony Messenger, picks up this message and executes the backtest in the background. This robust, queue-based approach is essential for handling computationally intensive tasks that can last from seconds to hours.

### Mercure: Real-Time Progress Updates

:::info
**Role:** Pushes live progress updates from the backtesting engine to the web UI.
:::

While the Messenger component runs the backtest in the background, the Mercure component provides a real-time communication channel back to the user's browser.

As the `Backtester` processes data, the `RunBacktestMessageHandler` periodically publishes updates to a specific Mercure topic (e.g., `/backtests/your-run-id/progress`). The frontend subscribes to this topic and updates the progress bar and status messages live, without needing to poll the server.

## Learning More About Symfony

To dive deeper into the underlying framework, the official Symfony documentation is the ultimate resource.

* **[Symfony Documentation](https://symfony.com/doc/current/index.html)** (Main Portal)
* **[Messenger Component](https://symfony.com/doc/current/messenger.html)**
* **[Mercure Component](https://symfony.com/doc/current/mercure.html)**
