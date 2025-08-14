# ⚡️BLend — Unlock Real Yield from Your Bitcoin

> Your BTC deserves better than collecting digital dust.

**BLend** is the first truly decentralized Bitcoin lending protocol on Internet Computer (ICP).

No wrapped assets. No bridges. No compromises.

- 🚀 Earn interest on BTC, ETH, or stablecoins
- 🔐 Borrow against your BTC with clear risk controls
- 💥 Liquidate toxic debt, earn protocol rewards
- 🧠 Simple login via Internet Identity — no seed phrases

### Why BLend?

Because Bitcoin shouldn’t sleep.  
It should work for you — securely, natively, and 24/7.

> **Stake ETH. Farm memes. But finally... Lend your BTC.**

---

## The Whole Project Thing

📚 [EN Detailed Docs xD](https://github.com/guoying2026/IC-Vibe-Coding-Template-Rust/blob/main/Docs_EN.md)

📖 [CN 详细文档](https://github.com/guoying2026/IC-Vibe-Coding-Template-Rust/blob/main/Docs_CN.md)

📚 [EN Mechanism Docs ](https://github.com/guoying2026/IC-Vibe-Coding-Template-Rust/blob/main/MECHANISM_EN.md)

📖 [CN 技术文档 ](https://github.com/guoying2026/IC-Vibe-Coding-Template-Rust/blob/main/MECHANISM_CN.md)

📚 [EN User Guide ](https://github.com/guoying2026/IC-Vibe-Coding-Template-Rust/blob/main/TUTORIAL_EN.md)

📖 [CN 用户指南 ](https://github.com/guoying2026/IC-Vibe-Coding-Template-Rust/blob/main/TUTORIAL_CN.md)

The very technical proposal is below:

### 💡 Protocol Naming Explanation (What does "BLend" mean?)

The naming of BLend deeply interprets the core philosophy of our protocol:

- **B** → Bitcoin, the value anchor of crypto finance
- **Lend** → Lending behavior, the most fundamental and widely used financial tool in DeFi
- **Blend** → Integration, reconstruction, and recreation, symbolizing our redefinition of BTC usage

We hope to convey our commitment to BTC through this name:  
Not just a store of value asset, but efficient capital in the DeFi world.

---

### 🧩 Core Vision (What We Aim to Build)

By deeply integrating **"B" and "Lend"**, **BLend** is committed to building a:

- **Bitcoin-centric**
- **Efficient lending capability**
- **Cross-chain liquidity support**
- **Trustless, verifiable, composable**

native **decentralized financial protocol**, serving BTC users and developers, and promoting Bitcoin financial infrastructure construction in the ICP ecosystem.

---

## II. Core Operation Mechanism

### 🏦 Borrow

**BLend's borrowing interest rate adopts a dynamic interest rate model based on utilization rate**, balancing incentives between lenders and borrowers as supply and demand change.

#### 📐 Utilization Rate

The utilization rate measures what proportion of liquid assets in the current pool have been borrowed:

&nbsp;

$$
U = \frac{Amount of assets already borrowed}{Total assets in pool (borrowed + available)}
$$

&nbsp;

For example: Suppose there are 100 BTC in the pool, and 60 BTC have been borrowed, then U=60%.

&nbsp;

<div align="center">

| Parameter                | Value |
| ------------------------ | ----- |
| Base Rate                | 1.2%  |
| Utilisation Optimal Rate | 70%   |
| Slope 1                  | 2%    |
| Slope 2                  | 40%   |

</div>

&nbsp;

When $U \leq U_{optimal}$:

$$
BorrowRate = BaseRate + \left( \frac{U}{U_{optimal}} \right) \times Slope1
$$

When $U > U_{optimal}$:

$$
BorrowRate = BaseRate + Slope1 + \left( \frac{U - U_{optimal}}{1 - U_{optimal}} \right) \times Slope2
$$

&nbsp;

### 💰 Supply Rate

When each user provides liquidity, the system automatically allocates **10%** of their deposited amount to the protocol's **Reserve Factor** as risk buffer funds for the pool.

However, these funds still belong to the user and can be withdrawn at any time, and will be returned when the user chooses to **fully exit liquidity**.

Additionally, the **deposit interest rate (Supply Rate)** is determined by the interest paid by borrowers. After the platform collects a small fee, **the remaining profits are distributed proportionally to all depositors**, and all liquidity providers will receive **fair profit distribution** based on their proportion in the pool.

### 💸 Deposit Fund Allocation Logic

Assuming the user's total deposit amount is:

$$
Deposit_{user} = X
$$

Where:

- **15%** is allocated to the reserve pool (10% platform fee + 5% still belongs to the user)
- **85%** enters the main pool that can participate in profit distribution

Then:

$$
ReserveShare_user = 0.15× X
$$

$$
ActiveLiquidity_user = 0.85 × X
$$

When the user exits, both parts will be returned:

$$
Withdraw_user = ReserveShare_user + ActiveLiquidity_user + AccruedInterest_user
$$

Each user i's annualized earnings are:

$$
UserEarningsi​=(Total Interest per year​×(1−ReserveFactor))
$$

### 🔁 Repay

Repay refers to borrowers repaying the borrowed BTC (or other assets) to the lending pool, returning principal and interest, releasing collateral, and restoring borrowing capacity.

In the **BLend protocol**, we are committed to making users clearly perceive borrowing costs, no longer hiding "debt" behind complex APR/APY or technical terms.

### 👤 User Perspective

1. User initiates repayment, **sees only one total amount** (interest + principal)
2. System prioritizes deducting accumulated interest payable (`Accrued Interest`)
3. Remaining portion used to repay principal (`Borrowed Principal`)
4. Update user's borrowing balance and health factor
5. If all debt is cleared, **release locked collateral assets**

### 🛠 Technical Level

1. Verify user input repayment amount > 0
2. Check if the repaid asset corresponds to a supported lending pool
3. Get the maximum amount the user needs to repay
4. Ensure user has existing borrowings (borrowed amount > 0)
5. Verify user repayment amount ≤ current borrowing amount
6. Transfer repayment assets to the corresponding lending pool
7. Update user's borrowing balance data

### 💰 Withdraw

Withdraw refers to users choosing to partially or fully withdraw their deposited BTC (or other assets) and accumulated earnings after providing liquidity.

### 👤 User Perspective Operation Flow

1. User initiates `Withdraw` operation (can choose partial or full)
2. Protocol calculates current withdrawable asset amount, including:
   - Initial deposited principal
   - Earned interest (`Accrued Interest`)
3. If pool liquidity is sufficient, assets are returned to user immediately
4. If withdrawal amount exceeds available balance in pool, handle via "gradual withdrawal mechanism" (see below)
5. After successful withdrawal, user's supply status is updated synchronously

### 💥 Liquidation Mechanism

When a borrower's asset value falls, or borrowing amount is too high, causing insufficient collateral to cover debt, the system must intervene promptly to partially or fully close their position to prevent protocol losses. This is **Liquidation**.

Main purposes of liquidation mechanism:

- ⛔ Avoid protocol losses due to bad debts
- 🧮 Recover debt through auction or discounted sale of collateral
- 🔐 Ensure overall system health and depositor fund safety

> 💡 Liquidation is a core risk management module in DeFi protocols.

| Parameter             | Meaning                                                        | ICP  | BTC/ETH | USDC |
| --------------------- | -------------------------------------------------------------- | ---- | ------- | ---- |
| Collateral Factor     | Proportion of borrower's total collateral that can be borrowed | 0.75 | 0.7     | 0.8  |
| Liquidation Threshold | Maximum borrowing ratio available for collateral assets        | 0.80 | 0.75    | 0.85 |
| Liquidation Bonus     | Discount reward received by liquidator                         | 0.05 | 0.05    | 0.05 |

### Health Factor (HF)

We use Health Factor (HF) to measure account safety:

$$
Health Factor = (Collateral Asset Value × Liquidation Threshold) / (Total Borrowed + Accumulated Interest)
$$

- If **HF ≥ 1**: Account is healthy, safe operation
- If **HF < 1**: Account is unhealthy, enters liquidation process

### Multi-Asset Health Factor Calculation

We use the following formula to calculate Health Factor (HF) including multiple assets:

$$
HF = \frac{
\sum_i (\text{Collateral Asset}_i \times \text{Current Price}_i \times \text{Liquidation Threshold}_i)
}{
\sum_j (\text{Borrowed Asset}_j + \text{Corresponding Accumulated Interest}_j)
}
$$

#### In other words:

- **Numerator**: Total weighted value of **all your collateral assets** (considering liquidation threshold)
- **Denominator**: **All your borrowed asset principal + respective interest**

## Liquidation Process (Simplified)

1. Anyone discovers that a certain account's Health Factor (HF) is below 1.
2. Initiate liquidation logic, allowing liquidators to repay all their debt.
3. In exchange, liquidators can obtain borrower's collateral assets at a discount.
4. Borrower's account is fully liquidated, health factor restored to safe level.

> ⚠️ Current stage, liquidators only support one-time liquidation of all debt. Future versions will upgrade to support **partial liquidation**. If safety is not restored after liquidation, the system will continue liquidation until account is zeroed or safety is restored.

---

### 👤 User Perspective: If I'm a Borrower

- You borrow assets, the system tracks your health factor in real-time.
- If BTC price falls, your collateral asset value decreases.
- Once HF < 1, the system **"sells"** part of your collateral assets to liquidators.
- You lose part of your collateral assets and bear liquidation costs (usually reflected as discounted processing).
- ✅ Best to actively add collateral or repay when HF approaches 1 to avoid liquidation.

---

### 🦾 Liquidator Perspective: How to Make Money?

- Liquidators can use funds to repay part of others' debt.
- System sells collateral assets to liquidators at **discounted prices (5% - 10%)**.
- Example:
  - You repay debt worth 1 BTC,
  - System gives you collateral assets worth 1.1 BTC,
  - 💰 Your profit is the 10% difference (0.1 BTC).

> 📌 Liquidation rewards vary for each asset. To ensure BTC liquidity, **BTC liquidation reward is the highest at 10%.**

## II. User Guide

### Getting Started

![Internet Identity Login Interface](picture/ICP_login.png)

<p align="center"> Internet Identity Login Interface

Create your own "Internet Identity", then you can start exploring Blend!

### Core Operations

### Supplying / Depositing Assets

- Deposit operations are located on the "Earn" page, which will display 4 vault options. Please select the amount of assets you want to deposit and click the "Deposit" button.
- Once successfully deposited, your assets will **automatically start earning interest** without any additional operations.
- In "Personal Center", you can view your **principal and accumulated interest** in real-time. Interest is settled daily and displayed together with principal.
- After earnings are credited, you can **withdraw principal and interest together at any time**. If the amount is large, the system will automatically enable **gradual withdrawal mechanism**, crediting in batches to ensure pool stability.

### Borrowing Assets

- Click "Connect Identity" to enter the system.
- Go to the "Borrow" page, select collateral assets (ICP, BTC, ETH, USDC), set the amount you want to collateralize and submit.
- The system will prompt you with the maximum amount you can borrow based on your collateral assets. After selecting the borrowing amount, click "Confirm Borrow".
- On the "Personal Center" page, you can view the following information in real-time:
  - Current total debt (including interest)
  - Health factor (representing account liquidation risk)
  - Accumulated interest growth (updated daily)
- Borrowings can be **partially or fully repaid at any time**. Once fully repaid, collateral assets will be automatically unlocked and withdrawable.

## III. Protocol Mechanics - Developer/Advanced User Perspective

### 🛠 Supply Logic

When users deposit assets into the protocol, the system processes according to the following flow:

1. **Validate Input Amount**
   Ensure `NumTokens > 0`, 0 amount is invalid.

2. **Verify Pool Existence**
   Confirm that the pool corresponding to the user-specified `token_id` has been created.

3. **Check Pool Remaining Capacity**
   Ensure current pool still has sufficient space:
   `(Maximum capacity - Current capacity) ≥ User input amount`

4. **Update Pool Balance**
   Add user-submitted assets to the corresponding pool.

5. **Record User Contribution Information**
   Update user's contribution records while updating pool's token balance.

### 🛠 Borrow Logic

When users attempt to borrow assets, the system executes the following steps to ensure borrowing is safe and compliant:

1. **Validate Input Amount**
   Ensure `NumTokens > 0`, otherwise reject the request.

2. **Verify Pool Existence**
   Check if the user-specified `token_id` corresponds to an available pool.

3. **Validate Collateral Asset Legitimacy**
   Check if user's deposited collateral assets meet the pool's support conditions (e.g., whether it accepts ICP/BTC/ETH, etc.).

4. **Calculate Maximum Borrowable Amount**
   Calculate `MaxBorrowableAmount` based on user's collateral asset value, liquidation threshold, current borrowing status, and other factors.

5. **Validate Request Amount Compliance**
   Verify: `NumTokens ≤ MaxBorrowableAmount`, preventing over-borrowing.

6. **Disburse from Pool**
   If funds are sufficient, deduct borrowing amount from corresponding pool and transfer to user address.

7. **Update User Borrowing Status**
   Increase user's `BorrowedAmount` and record initial interest accrual start time and other information.

### 🔁 Repay

When users initiate repayment operations, the system will process according to the following standard flow:

1. **Validate Input Amount**
   Ensure repayment amount `NumTokens` is greater than 0, avoiding invalid transactions.

2. **Verify Lending Pool Existence**
   Check if the input `token_id` corresponds to an existing supported lending pool.

3. **Confirm User Has Outstanding Debt**
   System will confirm that the user has valid borrowing records in this pool.

4. **Calculate Maximum Repayable Amount**
   Including principal and accumulated interest payable, ensuring users understand their total debt situation.

5. **Validate Repayment Amount Not Excessive**
   Input repayment amount must not exceed user's current repayable amount, avoiding processing excess funds.

6. **Execute Repayment Operation**
   Transfer assets to corresponding lending pool, system will prioritize repaying accumulated interest, remaining portion used to repay principal.

7. **Update Borrowing Interest Rate Model**
   Based on the pool's latest utilization rate after repayment, system will dynamically adjust interest rates, maintaining market incentive mechanism balance.

8. **Update User Borrowing Records and Health Factor**
   System will synchronously update user's debt information and recalculate health factor to reflect their account safety status.

### 🧾 Withdraw Operation Flow

The withdrawal process is not just about taking money out. The system is not stupid - it needs to confirm layer by layer that you really have money to withdraw, not giving away for free.

1. **Check Input Legitimacy**
   Ensure your input `NumTokens > 0`, don't think about withdrawing air.

2. **Verify Pool Existence**
   Check if the corresponding `token_id` really has a pool, otherwise you're talking to air.

3. **Confirm You Really Have Deposits**
   System will check if you have indeed deposited coins in this pool, don't try to fake it.

4. **Calculate Maximum Withdrawable Amount**
   System considers whether you have borrowed money, if there's partial occupation, only allowing you to withdraw assets within safe range.

5. **Check If What You Want to Withdraw Exceeds Maximum**
   Withdraw too much? No, exceeding your rightful portion, system will stop.

6. **Check If That Portion of Assets Is Not Collateralized**
   If part of your deposits is carrying debt, don't expect to get it back now.

7. **Transfer Assets from Pool to You**
   After all checks pass, system will transfer corresponding `NumTokens` from pool to your wallet.

8. **Update User and Pool Status Data**
   System will synchronously update your `Supply` status and pool's available balance.

### 💥 Liquidate

When a borrower's account health factor falls below the protocol's liquidation threshold, the system will allow third-party liquidators to intervene for debt liquidation operations. Below is the standard execution flow:

1. **Check Borrower Existence**
   Verify if target address is a legitimate account and confirm they have outstanding borrowing records.

2. **Calculate Health Factor**
   Based on collateral value, liquidation threshold, total borrowing and accumulated interest, assess user's account health status. If health factor is **less than 1**, trigger liquidation process.

3. **Calculate Amount Liquidator Needs to Pay**
   Based on current borrower's total debt, determine the asset amount liquidator needs to pay for full liquidation (usually including certain proportion of reward incentives).

4. **Calculate Maximum Collateral Amount Liquidator Can Obtain**
   Based on protocol's liquidation discount ratio (Liquidation Bonus), calculate maximum collateral assets liquidator can obtain at discounted price.

5. **Execute Liquidation Operation**
   Liquidator repays part or all of borrower's debt, protocol transfers corresponding collateral proportionally to liquidator's account.

6. **Update System Status**
   Protocol updates liquidated user's `Borrow` and `Supply` status in real-time, while synchronizing pool's total assets and available liquidity information.

## 📋 Prerequisites

- Node.js (v18 or higher)
- DFX (v0.28.0 or higher)
- Rust (latest stable version)
- Internet connection for canister deployment

## 🛠️ Installation and Setup

### 1. Clone Repository

```bash
git clone <repository-url>
cd icp_1
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd src/frontend
npm install
cd ../..
```

### 3. Start Local Environment

```bash
# Start DFX replica
dfx start --clean --background

# In new terminal, deploy all canisters
dfx deploy
```

### 4. Start Development Server

```bash
# Start frontend development server
npm start
```

## 🏗️ Project Structure

```
icp_1/
├── src/
│   ├── backend/                    # Rust backend canister
│   │   ├── src/
│   │   │   ├── lib.rs             # Main lending protocol logic
│   │   │   └── types.rs           # Data structures and types
│   │   ├── Cargo.toml             # Rust dependencies
│   │   └── backend.did            # Auto-generated Candid interface
│   ├── frontend/                   # React frontend application
│   │   ├── src/
│   │   │   ├── components/        # Reusable UI components
│   │   │   │   ├── Layout/        # Layout components (Header, etc.)
│   │   │   │   ├── UserInfoDisplay.tsx # User info display
│   │   │   │   ├── TokenBalanceDisplay.tsx # Token balance display
│   │   │   │   ├── LiquidityProvider.tsx # Liquidity provider
│   │   │   │   └── MarketDetail.tsx # Market details
│   │   │   ├── services/          # Backend service layer
│   │   │   │   ├── InternetIdentityService.ts # II authentication service
│   │   │   │   └── TokenBalanceService.ts # Token balance service
│   │   │   ├── views/             # Page components
│   │   │   │   ├── DashboardPage.tsx # Dashboard page
│   │   │   │   └── EarnView.tsx   # Earn page
│   │   │   ├── types/             # TypeScript type definitions
│   │   │   ├── hooks/             # Custom React hooks
│   │   │   │   └── useLanguage.tsx # Multi-language support
│   │   │   └── assets/            # Static resources
│   │   │       ├── btc.png        # Bitcoin icon
│   │   │       └── btc1.png       # BLend logo
│   │   ├── package.json           # Frontend dependencies
│   │   └── vite.config.ts         # Build configuration
│   └── declarations/              # Auto-generated canister interfaces
├── dfx.json                       # DFX configuration
├── Cargo.toml                     # Root Rust workspace
└── package.json                   # Root dependencies
```

## 🔧 Configuration

### Environment Variables

Create `.env` file in root directory:

```env
# DFX network configuration
DFX_NETWORK=local

# Canister IDs (auto-generated after deployment)
CANISTER_ID_BACKEND=your_backend_canister_id
CANISTER_ID_FRONTEND=your_frontend_canister_id
CANISTER_ID_INTERNET_IDENTITY=your_ii_canister_id

# Development settings
VITE_DFX_NETWORK=local
VITE_CANISTER_ID_BACKEND=your_backend_canister_id
VITE_II_CANISTER_ID=your_ii_canister_id
```

## 🚀 Deployment

### Local Development

```bash
# Start local replica
dfx start --clean --background

# Deploy all canisters
dfx deploy

# Start frontend development server
npm start
```

### Mainnet Deployment

```bash
# Set network to mainnet
dfx config --network ic

# Deploy to mainnet
dfx deploy --network ic
```

## 🎨 Frontend Features

### Page Components

#### Dashboard Page (DashboardPage)

- **User Information Display**: Shows user authentication status, Principal ID and Account ID
- **Statistics Cards**: Key metrics like total earnings, total borrowing, average APY
- **Token Balances**: Real-time display of user's various token balances
- **Responsive Design**: Adapted for desktop and mobile devices

#### Earn Page (EarnView)

- **Asset Pool List**: Displays available lending asset pools
- **Market Details**: Click to view detailed market information and operation interface
- **Liquidity Management**: Supply and withdraw asset modal interfaces
- **Transaction History**: Shows user's transaction records

### Core Components

#### UserInfoDisplay

- **Identity Information**: Displays Principal ID and Account ID
- **Interactive Features**: Click eye icon to toggle show/hide, copy button
- **Recharge Instructions**: Dollar sign button shows recharge instructions
- **Modern Design**: Gradient backgrounds, card-based layout

#### TokenBalanceDisplay

- **Balance Queries**: Supports ICP, ckBTC and other token balance queries
- **Custom Tokens**: Allows users to add custom tokens
- **Real-time Updates**: Automatically refreshes balance data
- **Error Handling**: Graceful error prompts

#### MarketDetail

- **Market Statistics**: Total supply, total borrowing, available liquidity, etc.
- **Operation Interface**: Four operation tabs for supply, borrow, repay, withdraw
- **Real-time Calculation**: Dynamically calculates maximum available amounts and earnings
- **Transaction Preview**: Shows transaction details and expected earnings

### Multi-language Support

The application supports complete Chinese-English bilingual interface:

```typescript
// Language switching
const { t, language, toggleLanguage } = useLanguage();

// Using translations
<h1>{t("dashboard_title")}</h1>
<button>{t("connect_wallet")}</button>
```

Supported language keys include:

- User interface text
- Error messages
- Operation prompts
- Recharge instructions

## 🔐 Identity Authentication

### Internet Identity Integration

The application uses Internet Identity for secure authentication.

## 🚀 Quick Start

### Prerequisites

- Node.js 23+
- Rust 1.70+
- dfx 0.28+

### Installation

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd icp
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start local development**:

   ```bash
   dfx start --clean --background
   dfx deploy
   npm start
   ```

4. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:4943

## Backend Implemented Features

https://dashboard.internetcomputer.org/canister/d72ol-biaaa-aaaai-q32jq-cai

1. Pool Management
   create_pool(pool_config: PoolConfig) - Create new lending pool
   update_pool_collateral(token_id, collateral_id) - Add pool collateral
   remove_pool_collateral(token_id, collateral_id) - Remove pool collateral
   increase_maximum_token(token_id, maximum_token) - Increase pool capacity
   decrease_maximum_token(token_id, maximum_token) - Decrease pool capacity

2. Lending Operations
   supply(token_id, amount) - Deposit tokens to pool
   borrow(token_id, amount) - Borrow tokens from pool
   repay(token_id, amount) - Repay loan
   withdraw(token_id, amount) - Withdraw deposited tokens
   liquidate1(user, repay_token, target_collateral, repay_amount) - Liquidation

3. Asset Management
   update_contract_assets(config: AssetParameter) - Add new assets
   edit_contract_assets(token_id, name, collaterals_factor, interest_rate) - Modify asset parameters
   edit_contract_liquidation(liquidation) - Modify liquidation threshold

4. System Management
   update_interest_amount() - Settle interest (admin call)
   transfer_token(from, to, amount) - Transfer operation
   approve_token(from, to, amount) - Authorization operation

Query Functions (Query Methods)
These functions only read data and don't require user signatures:

- User Information
  get_user_info(principal: Principal) - Get user information
  register_user(principal, username) - Register user

- Pool Information
  get_pool_info(token: String) - Get pool details
  get_real_pool_amount(token: String) - Get real pool deposits
  get_pool_supply_apy(token: String) - Get deposit APY
  get_pool_borrow_apy(token: String) - Get borrow APY

- Calculation Functions
  cal_collateral_value(user: Principal) - Calculate collateral value
  cal_borrow_value(user: Principal) - Calculate borrow value
  cal_health_factor(user: Principal) - Calculate health factor
  max_borrow_amount(user: Principal) - Calculate maximum borrowable amount
  cal_interest(token: Principal) - Calculate interest rate
  cal_earning(token: Principal) - Calculate earnings

- System Information
  get_liquidation_threshold() - Get liquidation threshold
  get_token_decimals(token: Principal) - Get token decimals
  get_price(token: Principal) - Get token price (from Pyth oracle)

### Type Safety

## 🔧 Development

## 🚀 Production Deployment

### Mainnet Deployment Steps

1. **Prepare Environment**:

   ```bash
   dfx config --network ic
   ```

2. **Deploy Canisters**:

   ```bash
   dfx deploy --network ic
   ```

3. **Update Environment Variables**:

   - Set production canister IDs
   - Configure Internet Identity
   - Update price oracle endpoints

4. **Verify Deployment**:
   - Test all functionality
   - Verify authentication
   - Check data integration
   - Test multi-language features

### Security Considerations

- **Access Control**: Admin-only functions for pool management
- **Input Validation**: Comprehensive parameter validation
- **Error Handling**: Graceful error handling throughout the system
- **Rate Limiting**: Rate limiting for critical functions
- **Authentication**: Secure Internet Identity integration

## 📚 API Documentation

### Candid Interface

Complete Candid interface can be found in `src/backend/backend.did`:

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Built for the Internet Computer ecosystem ❤️**

**Frontend URL**: https://dk57g-aaaaa-aaaai-q32ka-cai.icp0.io/
**Backend**：https://dashboard.internetcomputer.org/canister/d72ol-biaaa-aaaai-q32jq-cai
