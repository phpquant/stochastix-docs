# Configuration

Stochastix uses a hierarchical configuration system that allows for sensible global defaults which can be easily overridden for specific backtest runs. The primary configuration file for your project is `config/packages/stochastix.yaml`.

This document outlines the available parameters within that file. Any of these settings can be overridden at runtime via CLI options or API request parameters.

## Global Defaults (`stochastix.defaults`)

This is the main root key for all global backtesting parameters.


### `bc_scale`

* **Description**: The default scale (number of decimal places) for all high-precision `bcmath` operations throughout the framework.
* **Type**: `integer`
* **Default**: `8`

```yaml
stochastix:
    defaults:
        bc_scale: 8
```

### `initial_capital`

* **Description**: The starting capital for each backtest.
* **Type**: `float`
* **Default**: `10000.0`

```yaml
stochastix:
    defaults:
        initial_capital: 50000.0
```

### `stake_currency`

* **Description**: The currency to use for all calculations, portfolio value, and staking.
* **Type**: `string`
* **Default**: `'USDT'`

```yaml
stochastix:
    defaults:
        stake_currency: 'USDT'
```

### `symbols`

* **Description**: A default list of trading symbols (e.g., pairs) to use for a backtest if not otherwise specified.
* **Type**: `array`
* **Default**: `['BTC/USDT']`

```yaml
stochastix:
    defaults:
        symbols: ['BTC/USDT', 'ETH/USDT']
```

### `timeframe`

* **Description**: The default candle timeframe for the backtest. Must be a valid timeframe recognized by the framework (e.g., `1m`, `5m`, `1h`, `4h`, `1d`).
* **Type**: `string`
* **Default**: `'1d'`

```yaml
stochastix:
    defaults:
        timeframe: '4h'
```

### `start_date` / `end_date`

* **Description**: The default date range for the backtest, in `YYYY-MM-DD` format. If `null`, the backtest will use all available data from the beginning (`start_date`) or to the very end (`end_date`).
* **Type**: `string|null`
* **Default**: `null`

```yaml
stochastix:
    defaults:
        start_date: '2023-01-01'
        end_date: '2024-01-01'
```

### `commission`

* **Description**: Defines the commission (trading fee) model for the simulation.
* **Type**: `array`
* **Default Model**:
    * `type`: `percentage`
    * `rate`: `0.001` (which is 0.1%)

There are three commission types available:
1.  **`percentage`**: A percentage of the total trade value.
2.  **`fixed_per_trade`**: A flat fee for every trade.
3.  **`fixed_per_unit`**: A fee based on the amount of the asset traded.

**Examples:**

```yaml
# Example 1: 0.075% fee per trade
stochastix:
    defaults:
        commission:
            type: 'percentage'
            rate: 0.00075

# Example 2: Flat $1.50 fee per trade
stochastix:
    defaults:
        commission:
            type: 'fixed_per_trade'
            amount: 1.50
            asset: 'USDT'

# Example 3: $0.002 fee per unit of the base asset traded
stochastix:
    defaults:
        commission:
            type: 'fixed_per_unit'
            rate: 0.002
```

### `data_source`

* **Description**: Specifies where the backtester should find its market data files.
* **Type**: `array`
* **Default**:
    * `exchange_id`: `'binance'`
    * `type`: `'stchx_binary'`

```yaml
stochastix:
    defaults:
        data_source:
            exchange_id: 'okx'
```

## Metrics Configuration (`stochastix.metrics`)

This section allows for fine-tuning the parameters of specific performance metrics.

### `beta`

* **Description**: Configures the Beta calculation.
* **Type**: `array`
* **Parameters**:
    * `rolling_window`: The number of data points to include in the rolling window for calculating the covariance and variance needed for Beta.
    * **Type**: `integer`
    * **Default**: `30`

```yaml
stochastix:
    metrics:
        beta:
            rolling_window: 60
```

## Full configuration example

This is a complete example of the `stochastix.yaml` configuration file with all possible keys set to their default values.

```yaml
stochastix:
    # Global default settings for all backtests.
    # These can be overridden via CLI options or API requests.
    defaults:
        # The default scale (number of decimal places) for all bcmath operations.
        bc_scale: 8

        # Default trading symbols.
        symbols: ['BTC/USDT']

        # Default timeframe (e.g., 1m, 5m, 1h, 1d, 1w, 1M).
        timeframe: '1d'

        # Default start date (YYYY-MM-DD). If null (~), the backtest uses all available historical data.
        start_date: ~

        # Default end date (YYYY-MM-DD). If null (~), the backtest runs to the end of the data.
        end_date: ~

        # Default initial capital.
        initial_capital: 10000.0

        # Default currency for staking and reporting.
        stake_currency: 'USDT'

        # Default stake amount per trade. Can be a fixed value (e.g., 1000) or a percentage ("2.5%").
        # If null, the strategy must handle position sizing itself.
        stake_amount: ~

        # Default commission (trading fee) model.
        commission:
            # Type can be 'percentage', 'fixed_per_trade', or 'fixed_per_unit'.
            type: 'percentage'
            # Rate for 'percentage' (e.g., 0.001 for 0.1%) or 'fixed_per_unit'.
            rate: 0.001
            # Amount for 'fixed_per_trade' (e.g., 1.5 for $1.50).
            amount: ~
            # The asset in which the commission is charged (e.g., USDT).
            asset: ~

        # Default data source configuration.
        data_source:
            # The exchange identifier used for locating data files (e.g., 'binance', 'okx').
            exchange_id: 'binance'
            # The type of data source. Currently, only 'stchx_binary' is supported.
            type: 'stchx_binary'
            # Options specific to the 'stchx_binary' data source type.
            stchx_binary_options: []
            # Placeholders for future data source types.
            csv_options: []
            database_options: []

    # Configuration for specific performance metrics.
    metrics:
        # Configuration for the Beta calculation.
        beta:
            # The number of data points for the rolling window calculation.
            rolling_window: 30
```
