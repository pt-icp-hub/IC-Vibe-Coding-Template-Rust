# 🟧 BLend: BTC Lending Protocol on ICP

## 📌 Protocol Introduction

As native Bitcoin DeFi continues to evolve, more and more outstanding projects are exploring how to unlock BTC's on-chain liquidity. However, we have observed that:

> Despite the rapid development of this sector, there is still a **lack of a mature, native, and highly optimized BTC lending protocol** within the **ICP ecosystem**.

**BLend** was created to fill this gap — aiming to become a truly BTC-focused, decentralized financial infrastructure built natively on ICP.

![BLend Logo](picture/BLend%20Logo.png)

## 💡 Name Meaning: What does “BLend” stand for?

The name _BLend_ embodies the core philosophy behind our protocol:

- **B** → Bitcoin, the foundational value anchor of crypto finance
- **Lend** → Lending, one of the most fundamental and widely adopted primitives in DeFi
- **Blend** → Fusion, reconstruction, and reinvention — symbolizing our reimagination of BTC utility

With this name, we aim to express our commitment to Bitcoin:  
Not just as a store of value, but as **a productive capital** in the world of DeFi.

### 🧩 Our Core Vision: What Are We Building?

By deeply blending **“B” (Bitcoin)** and **“Lend” (Lending)**, **BLend** aims to create a:

- **Bitcoin-centric** protocol
- With **efficient lending capabilities**
- That enables **cross-chain liquidity**
- And is **trustless, verifiable, and composable**

A truly native **decentralized financial infrastructure** — serving BTC users and developers, and driving the growth of Bitcoin DeFi on ICP.

## 🏦 Borrowing: When You Need Extra Firepower

At **BLend**, the interest you pay when borrowing is determined by a **Dynamic Interest Rate Model based on Utilization Rate** — fancy words for a system that adapts as more people borrow.

#### 📐 Utilization Rate: How "Busy" is the Pool?

Utilization rate tells us what percentage of the liquidity in the pool has already been borrowed.

&nbsp;

$$
U = \frac{Total\ Borrowed\ Assets}{Total\ Liquidity\ (Borrowed + Available)}
$$

&nbsp;

**Example:**  
If the pool has a total of 100 BTC and 60 BTC have been borrowed, then the utilization rate $U = 60\%$.

&nbsp;

<div align="center">

| Parameter                | Value |
| ------------------------ | ----- |
| Base Rate                | 1.2%  |
| Utilization Optimal Rate | 70%   |
| Slope 1                  | 2%    |
| Slope 2                  | 40%   |

</div>

&nbsp;

Now here's how we calculate your borrow rate, depending on how busy the pool is:

#### 🧮 If $U \leq U_{optimal}$ (i.e., the pool still has breathing room):

> You're borrowing at a relatively peaceful time.

$$
BorrowRate = BaseRate + \left( \frac{U}{U_{optimal}} \right) \times Slope1
$$

#### 🚨 If $U > U_{optimal}$ (i.e., everyone's grabbing money):

> You're borrowing during rush hour, and it's gonna cost a bit more.

$$
BorrowRate = BaseRate + Slope1 + \left( \frac{U - U_{optimal}}{1 - U_{optimal}} \right) \times Slope2
$$

&nbsp;

This system ensures fair pricing:

- **Low usage = low rates = good time to borrow**
- **High usage = higher rates = maybe wait or pay up**

## 💰 Supply Rate

When a user supplies assets into BLend, **10% of the deposited amount** is automatically allocated to the **Reserve Pool** — a buffer designed to absorb risk for the protocol.

But don’t worry — **that portion still belongs to you**, and you’ll get it back when you **fully withdraw** your liquidity.

Meanwhile, your **supply rate (interest earnings)** comes from the interest paid by borrowers.  
After the protocol takes a small fee, the **remaining interest is proportionally distributed** to all liquidity providers based on their share in the pool.

### 💸 Deposit Allocation Logic

Let’s say you deposit a total of:

&nbsp;

$$
Deposit_{user} = X
$$

Here’s how your funds are split:

- **10%** → Platform reserve (risk buffer)
- **5%** → Still counted as yours, just kept in reserve
- **85%** → Actively enters the pool to earn interest

So we calculate:

&nbsp;

$$
ReserveShare_{user} = 0.15 \times X
$$

$$
ActiveLiquidity_{user} = 0.85 \times X
$$

When you decide to withdraw, you’ll get back:

&nbsp;

$$
Withdraw_{user} = ReserveShare_{user} + ActiveLiquidity_{user} + AccruedInterest_{user}
$$

### 📈 Annualized Yield per User

Each user _i_ earns annually:

&nbsp;

$$
UserEarnings_i = TotalInterest_{year} \times (1 - ReserveFactor)
$$

That’s it — your deposit works while you chill 😎

## 🔁 Repay (Paying Back Your Loan)

"Repay" means returning the BTC (or any other borrowed asset) back to the lending pool — settling both the **principal + interest**, unlocking your collateral, and restoring your borrowing capacity.

At **BLend**, we believe **debt should be transparent**, not buried in confusing APR/APY jargon.

### 👤 User Perspective

1. You initiate repayment — **you’ll only see ONE number** (principal + interest).
2. The system **first deducts accrued interest** (`Accrued Interest`).
3. Remaining amount goes toward **paying off the principal** (`Borrowed Principal`).
4. Your **borrow balance and Health Factor** are updated.
5. If fully repaid, your **collateral is unlocked and withdrawable**.

### 🛠 Under the Hood (Tech Flow)

1. Check that repayment amount > 0.
2. Validate the asset exists in a supported lending pool.
3. Fetch the **maximum repayable amount** for the user.
4. Confirm the user actually has outstanding debt (> 0).
5. Ensure repayment amount ≤ outstanding loan.
6. Transfer funds into the **corresponding lending pool**.
7. Update the user's `borrowed` state.

---

## 💰 Withdraw (Getting Your Assets Back)

"Withdraw" means taking out your supplied BTC (or other assets), along with the **interest you've earned** — either partially or in full.

### 👤 User Flow

1. User initiates a `Withdraw` action — partial or full.
2. Protocol calculates how much you can withdraw:
   - Your **original deposit**
   - Your **accrued interest** (`Accrued Interest`)
3. If pool has enough liquidity → **instant payout** 🟢
4. If your request exceeds available funds → system enables **Slow Withdraw Mode™** 🐢 (more on that later)
5. Once processed, your **supply status is updated** accordingly.

> ⛽️ TL;DR: Repay clears your debt, Withdraw reclaims your assets. BLend ensures both are smooth, transparent, and user-first.

## 💥 Liquidation Mechanism

When a borrower’s collateral value drops — or the borrowed amount becomes too large — the system must step in to **partially or fully close the borrower’s position** to prevent losses.  
This process is called **Liquidation**.

### 🎯 Purpose of Liquidation

- ⛔ Prevent bad debt from hurting the protocol
- 🧮 Recover the debt by auctioning or discount-selling collateral
- 🔐 Ensure overall system health and protect depositors’ funds

> 💡 Liquidation is a **core risk management mechanism** in any DeFi lending protocol.

<div align="center">

| Parameter                 | Description                                        | ICP  | BTC/ETH | USDC |
| ------------------------- | -------------------------------------------------- | ---- | ------- | ---- |
| **Collateral Factor**     | Portion of collateral value allowed to be borrowed | 0.75 | 0.70    | 0.80 |
| **Liquidation Threshold** | Max borrowing ratio before triggering liquidation  | 0.80 | 0.75    | 0.85 |
| **Liquidation Bonus**     | Discount (bonus) granted to the liquidator         | 0.05 | 0.05    | 0.05 |

</div>

The **Health Factor (HF)** is like your wallet’s cholesterol level —  
a quick check to see if your position is healthy or on the verge of collapse 🫣.

It's calculated as:

$$
HF = \frac{\text{Collateral Value} \times \text{Liquidation Threshold}}{\text{Borrowed Amount} + \text{Accrued Interest}}
$$

- If **HF ≥ 1**: You're good! Your account is healthy and safe 🟢
- If **HF < 1**: Danger zone! You’re undercollateralized and eligible for liquidation 🔥

#### 📊 Health Factor with Multiple Collateral Assets

Most users don’t just deposit one coin, so let’s talk multi-asset portfolios.

When you deposit multiple types of collateral (e.g., ICP, BTC, ETH),  
your **overall Health Factor** is calculated like this:

$$
HF = \frac{
\sum_i (\text{Collateral}_i \times \text{Price}_i \times \text{LiquidationThreshold}_i)
}{
\sum_j (\text{Debt}_j + \text{AccruedInterest}_j)
}
$$

In plain English:

- **Numerator** = Your total collateral value, _adjusted for each asset’s liquidation threshold_
- **Denominator** = Everything you owe: principal + all accumulated interest

> The higher your HF, the safer your position. Think of it as your DeFi "credit score" — and yes, we’re watching it in real time 👀.

### 🔥 Liquidation Flow (Simplified Version)

1. Anyone spots an account with a **Health Factor (HF) < 1** — Uh-oh!
2. The liquidation process kicks in, allowing **liquidators** to repay the borrower’s debt.
3. In return, liquidators get the borrower’s collateral at a **discounted price**.
4. The borrower's account is fully liquidated, and the HF bounces back to a safe level.

> ⚠️ For now, we only support **full liquidation** — liquidators must repay the entire debt at once.  
> Future versions will allow **partial liquidation**. If HF remains unsafe after liquidation, the system will continue zapping the account until it’s either empty or healthy.

---

### 👤 Borrower's POV: “Wait, what just happened?”

- You borrowed some assets. The system tracks your **Health Factor** in real time.
- Then BTC price drops. Uh-oh — your collateral value just shrank.
- Once HF < 1, the protocol **sells your collateral to a liquidator** (at a discount).
- You lose part of your collateral and pay the price — literally — via liquidation penalties.
- ✅ Pro tip: Top up or repay when HF gets close to 1 to avoid the axe.

### 🦾 Liquidator's POV: “How do I make money here?”

- Liquidators repay a portion (or all) of someone else's bad debt.
- In return, they get **collateral at a discount (5%–10%)** — sweet deal.
- Example:
  - You repay debt worth 1 BTC.
  - The system gives you 1.1 BTC worth of collateral.
  - 💰 You pocket 0.1 BTC profit — not bad for some DeFi hustle!

> 📌 Different assets have different liquidation bonuses.  
> For maximum incentive, **BTC gives the highest reward: 10%** — because it’s king 👑.

## 🧪 Tokenomics

**Token Name**: BLEND 👩🏻‍🔬  
Other details: _Coming soon. Sit tight!_

## 📍 BLend Protocol Roadmap

### ✅ Mid-July 2025｜**The Birth of BLend**

- Officially launched on the ICP ecosystem, specializing in BTC lending
- Integrated wallet extensions & identity authorization (e.g., Internet Identity)
- Pyth Network oracle connected for real-time pricing accuracy
- Supported deposits & loans for core assets (BTC, ETH, ICP, USDC)
- Introduced Health Factor mechanism and one-click liquidation logic
- Initial release of the withdrawal throttling system and dynamic interest rate model

---

### 🔜 Q3 2025｜**Mainnet Optimization Phase**

- Enhanced user interface & interest rate curve display
- Live TVL tracking and liquidation leaderboard
- Partial liquidation support goes live
- Documentation portal & developer API endpoints released

---

### 🚧 Q4 2025｜**Feature Expansion & More Assets**

- Onboard more blue-chip assets (e.g., SOL, SUI)
- Launch of dual-mode vaults: “Stable Yield” & “Flexible Yield”
- Allow users to customize collateral factor combinations
- Start building real-time analytics: APR curves, Health Factor trends, etc.

---

### 🌉 Q1 2026｜**Cross-chain Expansion & Multi-pool Support**

- Begin cross-chain rollout: Arbitrum, Sui, and more
- Introduce Multi-pool Routing engine
- Cross-chain collateral & lending: BTC on ICP ↔ ETH on Arbitrum
- Integrate with LSD and RWA sector products for wider utility

---

### 🪙 Q2 2026｜**BLend Master Plan**

- Launch risk-isolated vaults & institutional-grade pools
- Release “1-click Refinance” tool
- Develop on-chain credit scoring system
- Kick off Beta for undercollateralized loans
- Pilot flash loan modules—yes, even on ICP

---

### 🌌 H2 2026｜**Tokenomics Launch (Preview)**

- Launch governance token: **$BLEND**
- Introduce incentive system: deposit mining, liquidation rewards, active user bonuses
- Roll out BLEND DAO governance module
- Release tokenomics whitepaper & DAO community forum

> 🛠️ This roadmap outlines our vision—actual delivery timelines may vary.
>
> Are you a builder, DeFi dreamer, or just a curious degenerate? Come build with us!  
> [Telegram](https://t.me/potato89757) / [X](https://x.com/potato89757_3) / [GitHub](https://github.com/looikaizhi)
