# ICP BTC DeFi - Bitcoin Decentralized Finance Platform | ICP 比特币 DeFi - 比特币去中心化金融平台

[English](#english) | [中文](#中文)

---

## English

A comprehensive Bitcoin DeFi platform built on Internet Computer Protocol with Morpho-inspired design and Apple-style UI.

### 🎯 Core Features

#### Multi-Page Navigation

- **Earn Page**: Supply BTC assets to earn competitive yields
- **Borrow Page**: Use Bitcoin as collateral to borrow other assets
- **Explore Page**: Discover Bitcoin DeFi opportunities (Coming Soon)
- **Migrate Page**: Move positions between protocols (Coming Soon)
- **Dashboard Page**: Portfolio management and analytics (Coming Soon)

#### Bitcoin Asset Support

- **BTC**: Native Bitcoin with 4.2% supply APY
- **WBTC**: Wrapped Bitcoin with 3.8% supply APY
- **cbBTC**: Coinbase Wrapped BTC with 4.5% supply APY
- **tBTC**: Threshold Bitcoin with 5.1% supply APY

#### Advanced DeFi Features

- **Collateralized Borrowing**: Use BTC assets as collateral
- **Health Factor Monitoring**: Real-time liquidation risk tracking
- **Dynamic APY Rates**: Market-driven interest rates
- **Multi-Language Support**: English and Chinese interface
- **Real-time Price Feeds**: 24h price change tracking

#### Design Excellence

- **Apple-Style UI**: Premium glassmorphism effects with backdrop blur
- **Morpho-Inspired Layout**: Professional DeFi interface design
- **Responsive Design**: Optimized for all device sizes
- **Dark Mode Support**: Automatic theme switching
- **Smooth Animations**: Fluid transitions and micro-interactions

### 🛠 Technology Stack

#### Frontend Architecture

- **React 19** + **TypeScript** for type-safe development
- **Tailwind CSS** for utility-first styling
- **Vite** for lightning-fast development
- **Custom Hooks** for state management and i18n

#### Backend Infrastructure

- **Internet Computer Protocol** for decentralized hosting
- **Rust** canisters for business logic
- **Candid** interfaces for type-safe communication

### 🚀 Getting Started

#### Prerequisites

- Node.js 18+ for frontend development
- dfx 0.27.0+ for ICP deployment
- Rust 1.70+ for canister development

#### Quick Start

```bash
# Clone and setup
git clone <repository-url>
cd icp_btc_defi

# Install dependencies
npm install

# Start local ICP network
dfx start --clean --background

# Deploy all canisters
dfx deploy

# Access the application
open http://ufxgi-4p777-77774-qaadq-cai.localhost:4943/
```

#### Demo Script

```bash
# Run automated demo
chmod +x demo.sh
./demo.sh
```

### 📱 User Guide

#### Getting Started

1. **Connect Wallet**: Click "Connect Wallet" in the top navigation
2. **Choose Action**: Navigate between Earn and Borrow pages
3. **Supply Assets**: Start earning yield on your Bitcoin holdings
4. **Borrow Safely**: Use supplied assets as collateral for borrowing
5. **Monitor Health**: Keep health factor above 1.5 for safety

#### Earn Page Features

- View all supported Bitcoin assets
- Real-time APY rates and price changes
- Supply assets to start earning yield
- Track daily earnings and portfolio value
- Market overview with key statistics

#### Borrow Page Features

- Use supplied assets as collateral
- Monitor borrowing power and health factor
- Borrow against Bitcoin collateral
- Repay loans to improve health factor
- Risk management guidelines and best practices

### 🏗 Component Architecture

#### Page Components

- **EarnPage**: Bitcoin yield farming interface
- **BorrowPage**: Collateralized borrowing interface
- **Header**: Multi-page navigation with wallet integration

#### Shared Components

- **BTCAssetCard**: Reusable asset display cards
- **WalletConnector**: Wallet connection management
- **ErrorDisplay**: Global error handling
- **Loader**: Loading state animations

#### Hooks & Utilities

- **useLanguage**: Multi-language support
- **Types**: Comprehensive TypeScript definitions
- **Utils**: Helper functions and formatters

### 🔒 Security & Risk Management

#### Built-in Safety Features

- Health factor monitoring with visual indicators
- Liquidation threshold warnings
- Real-time collateral value tracking
- Risk assessment and best practice guidelines

#### Smart Contract Security

- Built on Internet Computer's secure infrastructure
- Comprehensive error handling
- Type-safe inter-canister communication
- Automated testing and validation

### 🌐 Multi-Language Support

#### Supported Languages

- **English**: Complete interface translation
- **Chinese**: 完整的中文界面翻译
- **Dynamic Switching**: Real-time language toggle

#### Translation Features

- Context-aware translations
- Number and currency formatting
- Date and time localization
- Cultural adaptation for different markets

### 🚢 Deployment Options

#### Local Development

```bash
dfx start --clean --background
dfx deploy
```

#### Mainnet Deployment

```bash
dfx deploy --network ic
```

### 📊 Market Data & Analytics

#### Real-time Metrics

- Total Value Locked (TVL) across all assets
- 24-hour trading volume
- Active user count
- Average utilization rates

#### Asset Information

- Current prices and 24h changes
- Supply and borrow APY rates
- Collateral factors and liquidation thresholds
- Market utilization and available liquidity

### 🤝 Contributing

#### Development Process

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Add comprehensive Chinese comments to all code
4. Test across different languages and themes
5. Submit pull request with detailed description

#### Code Standards

- TypeScript strict mode enabled
- Comprehensive Chinese code comments
- Apple-style UI consistency
- Multi-language support for all text
- Responsive design requirements

### 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 中文

基于互联网计算机协议构建的综合性比特币DeFi平台，采用Morpho启发的设计和苹果风格UI。

### 🎯 核心功能

#### 多页面导航

- **收益页面**：供应BTC资产赚取有竞争力的收益
- **借贷页面**：使用比特币作为抵押品借贷其他资产
- **探索页面**：发现比特币DeFi机会
- **教程页面**：平台使用教程
- **仪表板页面**：投资组合管理和分析

#### 比特币资产支持

- **BTC**：原生比特币，4.2%供应年化收益率
- **WBTC**：包装比特币，3.8%供应年化收益率
- **cbBTC**：Coinbase包装BTC，4.5%供应年化收益率
- **tBTC**：Threshold比特币，5.1%供应年化收益率

#### 高级DeFi功能

- **抵押借贷**：使用BTC资产作为抵押品
- **健康因子监控**：实时清算风险跟踪
- **动态年化收益率**：市场驱动的利率
- **多语言支持**：英文和中文界面
- **实时价格源**：24小时价格变化跟踪

#### 设计卓越性

- **苹果风格UI**：高端毛玻璃效果与背景模糊
- **Morpho启发布局**：专业的DeFi界面设计
- **响应式设计**：针对所有设备尺寸优化
- **暗模式支持**：自动主题切换
- **流畅动画**：平滑过渡和微交互

### 🛠 技术栈

#### 前端架构

- **React 19** + **TypeScript** 类型安全开发
- **Tailwind CSS** 实用优先样式
- **Vite** 闪电般快速开发
- **自定义Hooks** 状态管理和国际化

#### 后端基础设施

- **互联网计算机协议** 去中心化托管
- **Rust** 容器业务逻辑
- **Candid** 接口类型安全通信

### 🚀 快速开始

#### 环境要求

- Node.js 18+ 前端开发
- dfx 0.27.0+ ICP部署
- Rust 1.70+ 容器开发

#### 快速启动

```bash
# 克隆和设置
git clone <repository-url>
cd icp_btc_defi

# 安装依赖
npm install

# 启动本地ICP网络
dfx start --clean --background

# 部署所有容器
dfx deploy

# 访问应用
open http://ufxgi-4p777-77774-qaadq-cai.localhost:4943/
```

#### 演示脚本

```bash
# 运行自动化演示
chmod +x demo.sh
./demo.sh
```

### 📱 用户指南

#### 入门指南

1. **连接钱包**：点击顶部导航中的"连接钱包"
2. **选择操作**：在收益和借贷页面之间导航
3. **供应资产**：开始在您的比特币持有上赚取收益
4. **安全借贷**：使用供应的资产作为借贷抵押品
5. **监控健康**：保持健康因子在1.5以上确保安全

#### 收益页面功能

- 查看所有支持的比特币资产
- 实时年化收益率和价格变化
- 供应资产开始赚取收益
- 跟踪每日收益和投资组合价值
- 关键统计数据的市场概览

#### 借贷页面功能

- 使用供应的资产作为抵押品
- 监控借贷能力和健康因子
- 对比特币抵押品进行借贷
- 还款以改善健康因子
- 风险管理指南和最佳实践

### 🏗 组件架构

#### 页面组件

- **EarnPage**：比特币收益农场界面
- **BorrowPage**：抵押借贷界面
- **Header**：集成钱包的多页面导航

#### 共享组件

- **BTCAssetCard**：可重用的资产显示卡片
- **WalletConnector**：钱包连接管理
- **ErrorDisplay**：全局错误处理
- **Loader**：加载状态动画

#### Hooks和工具

- **useLanguage**：多语言支持
- **Types**：全面的TypeScript定义
- **Utils**：辅助函数和格式化器

### 🔒 安全与风险管理

#### 内置安全功能

- 带视觉指示器的健康因子监控
- 清算阈值警告
- 实时抵押品价值跟踪
- 风险评估和最佳实践指南

#### 智能合约安全

- 基于互联网计算机的安全基础设施
- 全面的错误处理
- 类型安全的容器间通信
- 自动化测试和验证

### 🌐 多语言支持

#### 支持的语言

- **英文**：完整的界面翻译
- **中文**：完整的中文界面翻译
- **动态切换**：实时语言切换

#### 翻译功能

- 上下文感知翻译
- 数字和货币格式化
- 日期和时间本地化
- 不同市场的文化适应

### 🚢 部署选项

#### 本地开发

```bash
dfx start --clean --background
dfx deploy
```

#### 主网部署

```bash
dfx deploy --network ic
```

### 📊 市场数据与分析

#### 实时指标

- 所有资产的总锁仓价值（TVL）
- 24小时交易量
- 活跃用户数
- 平均利用率

#### 资产信息

- 当前价格和24小时变化
- 供应和借贷年化收益率
- 抵押因子和清算阈值
- 市场利用率和可用流动性

### 🤝 贡献指南

#### 开发流程

1. Fork仓库
2. 创建功能分支（`git checkout -b feature/amazing-feature`）
3. 为所有代码添加全面的中文注释
4. 跨不同语言和主题测试
5. 提交详细描述的拉取请求

#### 代码标准

- 启用TypeScript严格模式
- 全面的中文代码注释
- 苹果风格UI一致性
- 所有文本的多语言支持
- 响应式设计要求

### 📄 许可证

本项目采用MIT许可证 - 详情请参阅LICENSE文件。

---

### 📞 Support | 支持

**Frontend URL | 前端地址**: http://ufxgi-4p777-77774-qaadq-cai.localhost:4943/

**Backend Candid UI | 后端接口**: http://127.0.0.1:4943/?canisterId=ucwa4-rx777-77774-qaada-cai&id=ulvla-h7777-77774-qaacq-cai

For issues and questions, please open an issue on GitHub.

如有问题，请在GitHub上创建issue。
