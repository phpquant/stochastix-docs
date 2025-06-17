# Placing Orders

Once your strategy has analyzed market data and decided to make a trade, the next step is to place an order. In Stochastix, all order management is handled through a set of convenient helper methods available in the `AbstractStrategy` class.

## The Order Signal & Asynchronous Execution

A critical concept to understand is that orders are not executed instantly on the same bar they are placed. Stochastix follows a realistic, asynchronous execution model to prevent look-ahead bias.

1.  When you call `$this->entry()` or `$this->exit()` in your `onBar()` method, you are not placing the trade directly. Instead, you are creating an **`OrderSignal`** and queuing it for processing.
2.  The backtesting engine collects all signals generated during the current bar.
3.  At the beginning of the **next bar**, the `OrderManager` processes the queue and executes the trades. Market orders are typically filled at the `open` price of this next bar.

This ensures your strategy logic can only react to data that was available at the time of the decision.

## Entering a Position: `$this->entry()`

The `$this->entry()` method is your primary tool for opening a new position.

```php
$this->entry(
    DirectionEnum $direction,
    OrderTypeEnum $orderType,
    float|string $quantity,
    float|string|null $price = null,
    ?int $timeInForceBars = null,
    float|string|null $stopLossPrice = null,
    float|string|null $takeProfitPrice = null,
    ?string $clientOrderId = null,
    array|string|null $enterTags = null
): void
```

**Key Parameters:**

* `direction`: The direction of the trade, either `DirectionEnum::Long` or `DirectionEnum::Short`.
* `orderType`: The type of order to place.
* `quantity`: The amount of the asset to buy or sell.
* `price`: **Required for Limit and Stop orders**. For a `Limit` buy, this is the maximum price you're willing to pay. For a `Stop` buy, this is the price at which a market buy is triggered.
* `stopLossPrice`/`takeProfitPrice`: Set automatic market exit triggers for the position once it's opened.
* `enterTags`: An array of strings to label why this entry was triggered. These tags are shown in the backtest results for performance attribution.

### Order Type Examples

#### Market Order

The simplest order type. It will be executed at the open price of the next bar.

```php
use Stochastix\Domain\Common\Enum\DirectionEnum;
use Stochastix\Domain\Order\Enum\OrderTypeEnum;

// Go long with a market order
$this->entry(
    direction: DirectionEnum::Long,
    orderType: OrderTypeEnum::Market,
    quantity: '0.5'
);
```

#### Limit Order

A pending order that executes only if the market price reaches a specified level or better.

```php
// The current price is $105. We want to buy if it drops to $100.
$limitPrice = '100.0';
$currentPrice = '105.0';

if ($currentPrice > $limitPrice) {
    $this->entry(
        direction: DirectionEnum::Long,
        orderType: OrderTypeEnum::Limit,
        quantity: '0.5',
        price: $limitPrice, // The price must be provided
        clientOrderId: 'my-long-limit-1' // A unique ID is required for pending orders
    );
}
```

#### Stop Order (Stop-Market)

A pending order that becomes a market order once a specific price level is reached. This is often used to enter a breakout trade.

```php
// The current price is $95. We want to buy if it breaks above the resistance at $100.
$stopPrice = '100.0';

$this->entry(
    direction: DirectionEnum::Long,
    orderType: OrderTypeEnum::Stop,
    quantity: '0.5',
    price: $stopPrice, // The price that triggers the market order
    clientOrderId: 'my-breakout-buy-1'
);
```

## Checking State: `$this->isInPosition()`

Before entering a new trade, you should always check if you already have a position open for the current symbol. The `$this->isInPosition()` helper returns `true` or `false`.

```php
if (!$this->isInPosition()) {
    // It's safe to check for a new entry signal
    if ($emaFast->crossesOver($emaSlow)) {
        $this->entry(DirectionEnum::Long, OrderTypeEnum::Market, '0.5');
    }
}
```

## Exiting a Position: `$this->exit()`

To close an open position, use the `$this->exit()` method. It queues a market order for the opposite direction of your current position. You must specify the quantity to close. To close the entire position, you can get the quantity from the current position object.

```php
$openPosition = $this->orderManager->getPortfolioManager()->getOpenPosition($this->context->getCurrentSymbol());

if ($openPosition) { // Ensure a position actually exists
    if ($openPosition->direction === DirectionEnum::Long && $emaFast->crossesUnder($emaSlow)) {
        // Close the entire long position
        $this->exit($openPosition->quantity, exitTags: 'ema_cross_down');
    }
}
```

## Cancelling Pending Orders

If you have placed a `Limit` or `Stop` order that has not yet been filled, you can cancel it programmatically using the `clientOrderId` you provided when creating it.

```php
// In a previous bar, we placed a limit order:
// $this->entry(..., clientOrderId: 'my-long-limit-1');

// Now, market conditions have changed and we no longer want that order.
$this->cancelOrder('my-long-limit-1');
```
This removes the order from the pending order book so it will not be triggered in the future.
