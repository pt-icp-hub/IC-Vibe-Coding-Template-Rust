#!/bin/bash

# ICP BTC DeFi - Bitcoin去中心化金融平台演示脚本
# ICP BTC DeFi - Bitcoin Decentralized Finance Platform Demo Script

echo "🚀 ICP BTC DeFi - Bitcoin Decentralized Finance Platform"
echo "📱 ICP 比特币 DeFi - 比特币去中心化金融平台"
echo "==========================================================="
echo

# 检查dfx是否正在运行
if ! dfx ping local > /dev/null 2>&1; then
    echo "📡 Starting local dfx network..."
    echo "📡 正在启动本地dfx网络..."
    dfx start --clean --background
else
    echo "✅ dfx network is already running"
    echo "✅ dfx网络已在运行"
fi

echo

# 部署容器
echo "🏗️  Deploying canisters..."
echo "🏗️  正在部署容器..."
dfx deploy

echo

# 获取前端URL
FRONTEND_URL=$(dfx canister call frontend get_url 2>/dev/null || echo "http://$(dfx canister id frontend).localhost:4943/")

echo "🎉 Deployment complete!"
echo "🎉 部署完成！"
echo
echo "📱 Frontend URL | 前端地址: $FRONTEND_URL"
echo "🔧 Backend Candid UI | 后端接口: http://127.0.0.1:4943/?canisterId=$(dfx canister id backend)"
echo
echo "🎯 Platform Features | 平台功能:"
echo "  🟡 Bitcoin Asset Support | 比特币资产支持:"
echo "    • BTC - Native Bitcoin (4.2% APY)"
echo "    • WBTC - Wrapped Bitcoin (3.8% APY)" 
echo "    • cbBTC - Coinbase Wrapped BTC (4.5% APY)"
echo "    • tBTC - Threshold Bitcoin (5.1% APY)"
echo
echo "  💰 Earn Page | 收益页面:"
echo "    • Supply BTC assets to earn yield | 供应BTC资产赚取收益"
echo "    • Real-time APY and price tracking | 实时年化收益率和价格跟踪"
echo "    • Portfolio value monitoring | 投资组合价值监控"
echo "    • Daily earnings calculation | 每日收益计算"
echo
echo "  🏦 Borrow Page | 借贷页面:"
echo "    • Use BTC as collateral | 使用BTC作为抵押品"
echo "    • Health factor monitoring | 健康因子监控"
echo "    • Collateralized borrowing | 抵押借贷"
echo "    • Risk management tools | 风险管理工具"
echo
echo "  🔍 Multi-Page Navigation | 多页面导航:"
echo "    • Earn - Bitcoin yield farming | 收益 - 比特币收益农场"
echo "    • Borrow - Collateral borrowing | 借贷 - 抵押借贷"
echo "    • Explore - Market discovery (Coming Soon) | 探索 - 市场发现（即将推出）"
echo "    • Migrate - Position migration (Coming Soon) | 迁移 - 头寸迁移（即将推出）"
echo "    • Dashboard - Portfolio management (Coming Soon) | 仪表板 - 投资组合管理（即将推出）"
echo
echo "  🎨 Design Features | 设计特色:"
echo "    • Apple-style glassmorphism UI | 苹果风格毛玻璃UI"
echo "    • Morpho-inspired layout | Morpho启发的布局"
echo "    • Multi-language support (EN/中文) | 多语言支持"
echo "    • Dark mode with auto-switching | 自动切换的暗模式"
echo "    • Responsive design for all devices | 适配所有设备的响应式设计"
echo
echo "  🔒 Security & Risk Management | 安全与风险管理:"
echo "    • Health factor visualization | 健康因子可视化"
echo "    • Liquidation threshold warnings | 清算阈值警告"
echo "    • Real-time collateral tracking | 实时抵押品跟踪"
echo "    • Best practice guidelines | 最佳实践指南"
echo
echo "  ⚡ Technical Excellence | 技术卓越:"
echo "    • React 19 + TypeScript | React 19 + TypeScript"
echo "    • Internet Computer Protocol | 互联网计算机协议"
echo "    • Comprehensive Chinese code comments | 全面的中文代码注释"
echo "    • Type-safe development | 类型安全开发"
echo
echo "🔗 Quick Start Guide | 快速开始指南:"
echo "  1. Open the frontend URL in your browser | 在浏览器中打开前端地址"
echo "  2. Click 'Connect Wallet' to simulate connection | 点击'连接钱包'模拟连接"
echo "  3. Navigate between Earn and Borrow pages | 在收益和借贷页面间导航"
echo "  4. Supply BTC assets to start earning | 供应BTC资产开始赚取收益"
echo "  5. Use collateral to borrow safely | 使用抵押品安全借贷"
echo "  6. Monitor your health factor | 监控您的健康因子"
echo
echo "🌐 Multi-Language Support | 多语言支持:"
echo "  • Switch between English and Chinese | 在英文和中文间切换"
echo "  • Click the language toggle in top navigation | 点击顶部导航的语言切换"
echo "  • All interface elements are translated | 所有界面元素都已翻译"
echo
echo "To stop the demo | 停止演示:"
echo "  dfx stop" 