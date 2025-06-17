# Running a Backtest

Once you have created a strategy, the next step is to run it against historical data. Stochastix offers two primary methods for launching a backtest:

1.  **Command-Line Interface (CLI):** Ideal for automation, scripting, and precise control over all configuration parameters.
2.  **User Interface (UI):** A web-based form that provides a user-friendly way to configure and launch backtests.

::: tip UI Alternative
This guide will focus on the CLI method... For interactive use, backtests can be configured and launched from the [**New Backtest page in the UI**](./screenshots#new-backtest).
:::

::: warning
We're assuming Stochastix is installed using the Docker setup, which is the recommended way to run it. Therefore, we will use `make sf c="..."` to run commands in the Symfony container. If you're not using Docker, you can run the commands directly in your terminal using `php bin/console ...` instead.
:::

## The `stochastix:backtesting` Command

The core command for running a backtest is `stochastix:backtesting` (alias: `stx:backtest`). At a minimum, it requires one argument: the `alias` of the strategy you want to test (as defined in its `#[AsStrategy]` attribute).

A basic execution looks like this:

```bash
make sf c="stochastix:backtesting sample_strategy"
```

When run like this, the backtest will use all the default values defined in your `config/packages/stochastix.yaml` file.

## Overriding Configuration at Runtime

The real power of the CLI comes from its ability to override any default configuration for a single run. This allows for rapid experimentation without constantly editing YAML files.

### Specifying a Timeframe and Date Range

You can control the resolution and time period of the data used in the backtest.

* `--timeframe` or `-t`: Sets the candle size (e.g., `5m`, `1h`, `1d`).
* `--start-date` or `-S`: Sets the start date (`YYYY-MM-DD`).
* `--end-date` or `-E`: Sets the end date (`YYYY-MM-DD`).

```bash
# Run the strategy on a 4-hour timeframe for the year 2023
make sf c="stochastix:backtesting sample_strategy -t 4h -S 2023-01-01 -E 2023-12-31"
```

### Specifying Symbols

The `--symbol` (or `-s`) option lets you target specific trading pairs. You can use the option multiple times to run the backtest across several symbols in a single session.

```bash
# Test the strategy on both BTC/USDT and ETH/USDT
make sf c="stochastix:backtesting sample_strategy -s BTC/USDT -s ETH/USDT"
```

### Overriding Strategy Inputs

You can change any parameter you defined with an `#[Input]` attribute in your strategy using the `--input` (or `-i`) option. The format is `-i key:value`.

```bash
# Given a strategy with inputs 'emaFastPeriod' and 'emaSlowPeriod'

# Change the EMA periods for this specific run
make sf c="stochastix:backtesting sample_strategy -i emaFastPeriod:10 -i emaSlowPeriod:30"
```

### Overriding Global Configuration

For global settings like initial capital, you can use the `--config` (or `-c`) option.

```bash
# Run the backtest with an initial capital of 50000
make sf c="stochastix:backtesting sample_strategy -c initial_capital:50000"
```

## Saving and Reusing Configurations

For complex experiments, you can save a complete configuration to a JSON file and reuse it later.

1.  **Save a configuration:** Use the `--save-config` option. The command will resolve all other options and save the result to a file without running the backtest.

    ```bash
    make sf c="stochastix:backtesting sample_strategy -s SOL/USDT -i emaFastPeriod:5 --save-config=my_sol_test.json"
    ```

2.  **Load a configuration:** Use the `--load-config` option to run a backtest with the exact settings from a file.

    ```bash
    make sf c="stochastix:backtesting sample_strategy --load-config=my_sol_test.json"
    ```
    Any other CLI options used alongside `--load-config` will override the values from the JSON file.

## Execution Model: Synchronous vs. Asynchronous

The way a backtest is executed depends on how you launch it.

### CLI Execution (Synchronous)

When you run the `stochastix:backtesting` command from your terminal, the process is **synchronous**. The command invokes the backtesting engine directly and will not exit until the entire backtest is complete. Once finished, it will print the results summary directly to your console. This blocking behavior is ideal for scripting and automated tasks where you need to wait for the result before proceeding.

### UI / API Execution (Asynchronous)

When you launch a backtest from the web interface, the process is **asynchronous**. The UI sends a request to the API, which creates a `RunBacktestMessage` and dispatches it onto a message queue, returning a "queued" status almost instantly.

A separate, long-running worker process (`messenger-worker` service in `compose.yaml`) is responsible for picking up this message from the queue and executing the backtest in the background. This prevents web server timeouts and allows the UI to track the progress of the run in real-time.
