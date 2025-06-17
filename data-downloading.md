# Downloading Market Data

Reliable backtesting starts with high-quality historical data. Stochastix provides a built-in command-line tool to fetch OHLCV (Open, High, Low, Close, Volume) data from major cryptocurrency exchanges and save it in a highly efficient binary format.

Under the hood, this downloader uses the powerful CCXT library, giving you access to dozens of exchanges.

::: tip UI Alternative
While the CLI is powerful for scripting, these tasks can also be performed visually from the [**Data Management UI**](./screenshots#data-management).
:::

## The Download Command

The primary tool for fetching data is the `stochastix:data:download` command (alias: `stx:data:dl`).

### Command Signature

```bash
make sf c="stochastix:data:download <exchange> <symbol> <timeframe> [options]"
```

### Arguments

* **`exchange`**: The exchange ID as recognized by CCXT (e.g., `binance`, `okx`, `kraken`).
* **`symbol`**: The trading pair you want to download (e.g., `BTC/USDT`, `SOL/USDT`).
* **`timeframe`**: The candle size. This must be a timeframe supported by the specific exchange (e.g., `1m`, `5m`, `1h`, `1d`, `1w`).

### Options

* **`--start-date` or `-S`**: (Required) The date from which to start downloading data, in `YYYY-MM-DD` format.
* **`--end-date` or `-E`**: (Optional) The date at which to stop downloading data. If omitted, it will download data up to the current day.

## Step-by-Step Example

Let's download 1-day data for `ETH/USDT` from `Binance` for the entire year of 2023.

1.  Open your terminal in the root of your Stochastix project.
2.  Run the following command:

    ```bash
    make sf c="stochastix:data:download binance ETH/USDT 1d --start-date=2023-01-01 --end-date=2023-12-31"
    ```

3.  You will see a progress bar as the downloader fetches data in batches from the exchange.

    ```bash
    🚀 Stochastix OHLCV Data Downloader 🚀
    ======================================

    Download Progress
    -----------------

     287/364 [======================>-----]  78% | Fetched until: 2023-10-15 00:00:00 (1 recs)
    ```

4.  Once complete, you will see a success message indicating where the file has been saved.

## Data Storage Location

Downloaded data is stored in the `data/market/` directory of your project. The files are organized in a clear hierarchy:

`data/market/{exchange_id}/{symbol}/{timeframe}.stchx`

For the example above, the data would be saved to:

`data/market/binance/ETH_USDT/1d.stchx`

::: info
Note that the `/` in a trading symbol is automatically converted to an `_` for filesystem compatibility. The framework handles this conversion automatically when reading the data.
:::

The `.stchx` files are stored in a custom binary format designed for maximum read performance during backtesting. The next pages in this section will explain how to inspect these files and will provide their full technical specification.

## Asynchronous Downloading via the UI

While the CLI command is great for single downloads, the web UI provides an asynchronous way to manage multiple downloads. When you initiate a download from the UI, it sends a request to the API (`POST /api/data/download`), which queues the job for a background worker. This allows you to start several large downloads and monitor their progress in real-time without tying up your terminal.
