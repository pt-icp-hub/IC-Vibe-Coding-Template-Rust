# Protocol Mechanics - Developer/Advanced User Perspective

As of July 26, the BLend protocol primarily focuses on five core modules: Supply, Borrow, Repay, Withdraw, and Liquidate. These are the fundamental building blocks of any standard lending protocol. This document outlines each module's detailed execution logic.

## 🛠 Supply Logic

When a user deposits assets into the protocol, the system processes the transaction as follows:

1. **Validate Input Amount**  
   Ensure that `NumTokens > 0`. Zero is not a valid deposit.

2. **Verify Pool Existence**  
   Check if the specified `token_id` has a corresponding pool.

3. **Check Pool Capacity**  
   Confirm that the pool has enough room for the deposit:  
   `(Max Capacity - Current Pool Balance) ≥ NumTokens`.

4. **Update Pool Balance**  
   Add the deposited assets to the corresponding pool.

5. **Record User Deposit Info**  
   Update the user’s supply record and the total pool balance for that token.

## 🛠 Borrow Logic

When a user attempts to borrow assets, the system follows these steps to ensure safety and compliance:

1. **Validate Input Amount**  
   Ensure `NumTokens > 0`. Otherwise, the request is rejected.

2. **Verify Pool Existence**  
   Ensure that the selected `token_id` corresponds to an active pool.

3. **Validate Collateral Type**  
   Check whether the user's supplied collateral is supported by the pool (e.g., BTC, ETH, ICP, etc.).

4. **Calculate Maximum Borrowable Amount**  
   Based on the collateral value, liquidation thresholds, and existing borrow positions, determine `MaxBorrowableAmount`.

5. **Validate Borrow Request Against Limit**  
   Confirm that `NumTokens ≤ MaxBorrowableAmount` to avoid over-leveraging.

6. **Disburse Loan from Pool**  
   If liquidity is available, transfer the borrowed amount to the user’s address.

7. **Update Borrow Status**  
   Increase the user's `BorrowedAmount` and record the interest accrual timestamp.

## 🔁 Repay Logic

When a user initiates a repayment, the protocol performs the following operations:

1. **Validate Repayment Amount**  
   Ensure `NumTokens > 0` to avoid processing null transactions.

2. **Verify Pool Existence**  
   Check if the provided `token_id` matches an active lending pool.

3. **Confirm Outstanding Borrow Position**  
   Ensure the user has an active loan in the specified pool.

4. **Calculate Total Amount Due**  
   Includes principal and accrued interest. The user will see the full amount owed.

5. **Ensure Repayment Does Not Exceed Debt**  
   Reject overpayments. Only exact or partial repayments are allowed.

6. **Process Repayment**  
   Transfer funds to the pool. The system prioritizes interest before reducing the principal.

7. **Update Interest Rate Model**  
   Adjust the pool's utilization rate and borrowing rate accordingly.

8. **Update Borrow Records & Health Factor**  
   Refresh the user’s loan data and recalculate their account health factor.

## 🧾 Withdraw Logic

Withdrawals aren’t as simple as hitting “withdraw.” The protocol ensures it’s safe to release your funds:

1. **Validate Input Amount**  
   Ensure `NumTokens > 0`. No phantom withdrawals allowed.

2. **Verify Pool Existence**  
   Check if the given `token_id` maps to an existing pool.

3. **Confirm User Deposit**  
   The user must have a balance in the pool to withdraw from.

4. **Calculate Maximum Withdrawable Amount**  
   Consider borrowed positions and any partially locked collateral.

5. **Ensure Requested Amount ≤ Withdrawable Limit**  
   Prevent users from withdrawing more than they're allowed.

6. **Check for Locked Collateral**  
   If a portion of the deposit backs a loan, it can’t be withdrawn.

7. **Transfer Assets from Pool**  
   Once verified, `NumTokens` are transferred from the pool to the user.

8. **Update Pool & User States**  
   Reflect updated `Supply` and pool liquidity states in the system.

## 💥 Liquidate Logic

When a borrower's health factor drops below the liquidation threshold, third-party liquidators can step in. Here's how it works:

1. **Validate Borrower Existence**  
   Confirm the borrower address exists and has an active loan.

2. **Calculate Health Factor**  
   Use current collateral value, debt, interest, and thresholds. If Health Factor < 1, liquidation is enabled.

3. **Determine Liquidator’s Repayment Amount**  
   Calculate the amount a liquidator must pay to cover the borrower’s debt and trigger liquidation.

4. **Calculate Maximum Collateral Transfer**  
   Based on the liquidation bonus, determine how much discounted collateral the liquidator can claim.

5. **Execute Liquidation**  
   Liquidator repays the borrower’s debt, and in return, receives collateral from the protocol.

6. **Update Borrower & Pool Status**  
   Refresh the borrower’s `Borrow` and `Supply` records, and update the pool’s available liquidity.

## 🧠 Why We Use Pyth Network

We chose **Pyth Network** as our oracle provider for a few practical reasons — one of them being our backend engineer is thrifty (in a good way). Pyth is **open-source and free**, and he was already familiar with it.

While **ICP offers its own native oracle**, it’s more expensive in terms of gas fees. By using Pyth, **we only incur costs when the smart contract is actually called**, helping us reduce ongoing protocol expenses.

Security and reliability were also critical — Pyth is a leading oracle with a strong track record and robust infrastructure.

## 📈 Price Update Frequency & Mechanics

- **Frontend**: Updates every second to display real-time prices.
- **Backend**: Only updates prices when sensitive functions (e.g., borrow, repay) are triggered.

This hybrid model ensures **user responsiveness while minimizing gas usage**.

## 🚨 Oracle Failure Handling

If oracle data becomes unreliable or unavailable, **we will immediately suspend all critical operations** — including borrowing, repaying, and withdrawing.

Our tech team is **on standby 24/7** to resolve issues quickly, ensuring user and protocol funds remain secure.

> 🛡️ Safety-first. Risk-controlled. Always.
