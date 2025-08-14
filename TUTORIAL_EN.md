# User Guide

## 🚀 Getting Started

![Internet Identity Login Interface](picture/ICP_login.png)

<p align="center">Internet Identity Login Interface</p>

First, create your own **Internet Identity** — your key to accessing everything in BLend.  
Once that’s done, you’re ready to dive in and start exploring!

---

## ⚙️ Core Operations

### 💰 Supplying / Depositing Assets

- Head over to the **“Earnings”** page. You’ll see 4 vault options — choose one and enter the amount you want to deposit, then click **“Deposit”**.
- Once deposited, your assets will **start earning interest automatically** — no manual actions needed!
- You can track your **principal + accumulated interest** at any time in the **Personal Center**. Interest is calculated daily and reflected together with your balance.
- When you’re ready to withdraw, you can **withdraw both principal and interest anytime**.  
  For large amounts, the system will automatically trigger a **gradual withdrawal mechanism**, spreading your funds over multiple transactions to protect pool stability.

### 🏦 Borrowing Assets

- Click **“Connect”** to authenticate your identity and access the system.
- Go to the **“Borrow”** page, choose the collateral you want to lock up (ICP, BTC, ETH, or USDC), enter the amount, and hit **“Submit”**.
- Based on your collateral, the system will show you the **maximum borrowable amount**. Choose how much you want to borrow and click **“Confirm Borrow”**.
- On the **Personal Center** page, you can keep track of all the important stuff:

  - Total debt (including interest)
  - Your **Health Factor** (aka how close you are to getting liquidated 😬)
  - Accrued interest (updated daily — yay, compound interest!)

- You can **repay at any time**, either partially or in full. Once you clear your debt, your collateral is **automatically unlocked and ready for withdrawal**. 🎉

---

## III. 🧠 Protocol Mechanics (For Developers / Power Users)

### 🛠 Supply Logic (Developer View)

When a user supplies assets to the protocol, the following steps are executed under the hood:

1. **Validate input amount**  
   Ensure `NumTokens > 0` — zero is not a valid deposit.

2. **Verify pool existence**  
   Confirm that a pool corresponding to the specified `token_id` exists.

3. **Check pool capacity**  
   Ensure that the pool has enough room:  
   `(Max Pool Capacity - Current Pool Balance) ≥ NumTokens`.

4. **Update pool balance**  
   Add the supplied tokens to the pool.

5. **Record user deposit**  
   Update the user's supply record and the pool’s token capacity accordingly.

### 🛠 Borrow Logic

When a user tries to borrow some tokens, we don’t just throw the money at them — here’s what actually happens:

1. **Check if the user wants _more than zero_**  
   Because borrowing 0 tokens is just... philosophical. We need `NumTokens > 0`.

2. **Validate the token pool exists**  
   Ensure there's a lending pool for the given `token_id`. If not, no tokens for you.

3. **Check if the user has legit collateral**  
   User must have deposited accepted assets (like ICP, BTC, ETH, USDC). No imaginary coins allowed.

4. **Calculate max borrowable amount**  
   Based on deposited collateral, price feeds, liquidation thresholds, and protocol parameters, we compute how much the user _can_ borrow — safely.

5. **Ensure the user isn’t trying to YOLO too much**  
   The requested `NumTokens` must be ≤ `MaxBorrowableAmount`. Over-borrowing gets rejected.

6. **Transfer funds from the pool**  
   If the pool has enough liquidity, we send the tokens to the user. It's like a payday, except you owe us.

7. **Update the borrow record**  
   We update the user's borrow balance, interest tracking, and health factor. Basically: “Congrats, you're now officially in debt.”

### 🔁 Repay Logic

When a user wants to repay their loan — great! But we still need to verify they’re not just clicking buttons for fun.

Here’s what happens under the hood:

1. **Check if the user actually typed a number > 0**  
   `NumTokens > 0` — we don’t process fake generosity.

2. **Confirm there's a valid lending pool for the given token**  
   If this token isn't borrowable, repayment is meaningless.

3. **Verify the user really has a loan to repay**  
   No borrow history? No repayment needed. Don’t pretend to be responsible.

4. **Calculate the max repayable amount**  
   This includes all unpaid principal and accrued interest. Know your total tab.

5. **Ensure the user isn’t trying to over-repay**  
   `NumTokens` must be less than or equal to what they actually owe. No donations accepted.

6. **Send the repayment back to the pool**  
   We split it into interest and principal. The pool says: “Thanks for the tip.”

7. **Update borrow rate if utilization has changed**  
   Since repayment affects utilization, we recalculate the interest rate accordingly.

8. **Update the user’s borrow record**  
   New debt balance, reduced interest accumulation, and a better health factor. You're less likely to be liquidated — yay!

### 🏧 Withdraw

1. **Check the amount**: Make sure `Numtokens > 0`. No ghost withdrawals allowed.
2. **Validate the pool**: Ensure there's a pool that supports the given token ID.
3. **Verify ownership**: Confirm that the user actually has a deposit in this pool.
4. **Calculate max withdrawable amount**: Based on user's supply minus any borrowed amounts.
5. **Validate input**: Make sure `Numtokens <= max withdrawable amount`. No magic tricks.
6. **Check liquidity**: Ensure the pool has enough unborrowed tokens to meet the request.
7. **Transfer funds**: Send the appropriate amount from the pool back to the user.
8. **Update records**: Adjust the user's supply balance and pool's total state.

### 💥 Liquidate (Liquidation Mechanism)

When a borrower's health factor falls below the protocol-defined threshold, third-party liquidators are allowed to repay the borrower's debt and acquire a portion of their collateral. The following outlines the standardized liquidation flow:

1. **Verify Borrower Existence**  
   Ensure the target address is a valid user and has outstanding debt recorded in the system.

2. **Calculate Health Factor**  
   Evaluate the borrower's account by computing the Health Factor using the formula:  
   _(Collateral Value × Liquidation Threshold) / (Borrowed Amount + Accrued Interest)_.  
   If **Health Factor < 1**, liquidation is permitted.

3. **Determine Liquidation Payment Amount**  
   Calculate the total repayment amount required from the liquidator to cover the borrower's current debt. This typically includes both principal and accrued interest.

4. **Calculate Maximum Collateral Transferable to Liquidator**  
   Based on the protocol's liquidation bonus rate, determine the maximum value of collateral that can be seized by the liquidator at a discounted rate.

5. **Execute Liquidation**  
   The liquidator repays part or all of the borrower's outstanding debt. In return, the corresponding portion of collateral is transferred to the liquidator, according to the protocol-defined rules.

6. **Update System States**  
   The system updates the borrower's `borrow` and `supply` balances, and reflects changes in the pool’s available liquidity and total reserves.

Currently, only four assets are supported. As the system and developer experience improve, more assets will be added—stay tuned and get excited!
