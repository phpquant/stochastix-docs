# Advanced Order Management

Beyond simple market orders, a robust trading strategy needs to manage its risk and adapt to changing conditions. Stochastix provides built-in mechanisms for both protective stops and dynamic order cancellation, allowing for more sophisticated trade management.

## Stop-Loss and Take-Profit Orders

A critical component of risk management is defining an exit point *before* you enter a trade. The `$this->entry()` method includes optional `stopLossPrice` and `takeProfitPrice` parameters to automate this process.

```php
$currentPrice = '3000.0';
$slPrice = '2940.0'; // Stop-loss at -2%
$tpPrice = '3150.0'; // Take-profit at +5%

$this->entry(
    direction: DirectionEnum::Long,
    orderType: OrderTypeEnum::Market,
    quantity: '0.5',
    stopLossPrice: $slPrice,
    takeProfitPrice: $tpPrice
);
```

When you provide these parameters, you are not creating pending `STOP` or `LIMIT` orders in the traditional sense. Instead, you are attaching metadata to the position.

### Realistic Intra-Bar Execution

The backtesting engine uses this metadata to simulate a more realistic execution model. On every bar *after* the entry, the engine will check if the bar's `high` or `low` price crossed your specified levels.

* If you are **long**:
    * The engine checks if the bar's `low` was less than or equal to the `stopLossPrice`.
    * It checks if the bar's `high` was greater than or equal to the `takeProfitPrice`.
* If you are **short**:
    * The engine checks if the bar's `high` was greater than or equal to the `stopLossPrice`.
    * It checks if the bar's `low` was less than or equal to the `takeProfitPrice`.

If either condition is met, a market order is immediately created and executed at the stop/take-profit price, and the position is closed within that same bar. This is a more accurate simulation than waiting for the close of the bar, as it reflects how SL/TP orders work in live markets.

## Programmatic Order Cancellation

Strategies that use `Limit` or `Stop` orders to enter positions may need to cancel those orders if market conditions change. For example, if a limit order to buy a dip has not been filled and the market starts to trend down strongly, you may want to retract the order to avoid a bad entry.

This is possible with the `$this->cancelOrder()` method.

### Step 1: Place a Named Order

To cancel a pending order, you must first give it a unique identifier when you create it. This is done using the `clientOrderId` parameter.

```php
// In onBar(), we decide to place a limit order to buy a dip.
$limitPrice = '2800.0';

$this->entry(
    direction: DirectionEnum::Long,
    orderType: OrderTypeEnum::Limit,
    quantity: '0.5',
    price: $limitPrice,
    clientOrderId: 'my-long-dip-buy' // Give the order a unique name
);
```
This order is now sitting in the `OrderManager`'s pending order book, waiting for its price to be met.

### Step 2: Cancel the Order on a New Condition

On a subsequent bar, your strategy might detect a new condition (e.g., a trend indicator has turned bearish) and decide that the previous dip-buying idea is no longer valid. You can then use `cancelOrder()` with the same `clientOrderId`.

```php
// On a later bar...
$trendIndicator = $this->getIndicatorSeries('my_trend_indicator');

// If the trend has turned bearish, we must cancel our pending buy order.
if ($trendIndicator[0] < $trendIndicator[1]) {
    $this->cancelOrder('my-long-dip-buy');
}
```

This removes the order from the pending book, ensuring it will not be executed even if the price later drops to `$2800`.
