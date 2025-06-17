# Position Sizing

Proper position sizing is one of the most critical components of a successful trading strategy. Rather than trading a fixed number of contracts or shares, many strategies calculate their position size based on the current portfolio value and a predefined risk tolerance.

This guide will walk you through a common approach: calculating the trade quantity based on a fixed percentage of your available capital.

## Accessing Your Capital

Before you can calculate how much to trade, you need to know how much capital is available. This information is held by the `PortfolioManager`. You can access it from within your strategy via the `OrderManager`.

The `$this->orderManager` property (available in `AbstractStrategy`) gives you access to the `getPortfolioManager()` method, which in turn has a `getAvailableCash()` method.

```php
// Get the PortfolioManager
$portfolioManager = $this->orderManager->getPortfolioManager();

// Get the available cash as a high-precision string
$availableCash = $portfolioManager->getAvailableCash();
```

## Calculating Trade Quantity

Let's say you want to size your position to be equivalent to 2% of your available cash. Here is the step-by-step process, which should be performed inside your `onBar()` method.

### Step 1: Define Your Risk Percentage

First, define what percentage of your capital you want to allocate to this trade. It's often best to define this as an `#[Input]` property so you can easily configure it.

```php
use Stochastix\Domain\Strategy\Attribute\Input;

class MyStrategy extends AbstractStrategy
{
    #[Input(description: 'Stake amount as a percentage of capital', min: 0.001, max: 1.0)]
    private float $stakeAmount = 0.02; // Our 2% risk
    
    // ...
}
```

### Step 2: Calculate the Cash to Allocate

Inside `onBar()`, get your available cash and multiply it by your stake amount. We use `bcmul` to maintain precision.

```php
$availableCash = $this->orderManager->getPortfolioManager()->getAvailableCash();

// Calculate the amount of cash to use for this trade
$stakeInCash = bcmul($availableCash, (string) $this->stakeAmount);
```

### Step 3: Convert Cash to Asset Quantity

To determine the quantity of the asset to trade, you must divide the allocated cash by the asset's current price.

It is crucial to perform two sanity checks here:
1.  Ensure the current price is not zero to prevent a division-by-zero error.
2.  Ensure the final calculated quantity is large enough to be a valid trade.

```php
// Get the current close price from the $bars object
$currentClose = $bars->close[0];

// --- Sanity Checks ---
if ($currentClose === null || bccomp((string) $currentClose, '0') <= 0) {
    // Price is invalid, cannot calculate quantity.
    // You might want to log this.
    return;
}

// --- Calculate Quantity ---
$tradeQuantity = bcdiv($stakeInCash, (string) $currentClose);

// --- Final Sanity Check ---
if (bccomp($tradeQuantity, '0.000001') < 0) {
    // Quantity is too small to be a meaningful trade.
    return;
}

// Now, $tradeQuantity is ready to be used in an entry order.
$this->entry(
    direction: DirectionEnum::Long,
    orderType: OrderTypeEnum::Market,
    quantity: $tradeQuantity
);
```
This entire calculation logic is demonstrated in the sample strategy provided with the framework.
