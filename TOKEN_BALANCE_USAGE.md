# 代币余额查询功能

## 🪙 支持的代币类型

我们的系统支持查询以下代币的余额：

### 1. **ICP** - Internet Computer Protocol

- **Canister ID**: `ryjl3-tyaaa-aaaaa-aaaba-cai`
- **描述**: IC网络的原生代币
- **用途**: 支付gas费用、参与治理、质押等

### 2. **ckBTC** - Chain-key Bitcoin

- **Canister ID**: `mxzaz-hqaaa-aaaar-qaada-cai`
- **描述**: 比特币的IC版本，1:1锚定BTC
- **用途**: 在IC上进行比特币交易和DeFi操作

### 3. **SNS-1** - SNS Governance Token

- **Canister ID**: `zfcdd-tqaaa-aaaaq-aaaga-cai`
- **描述**: SNS治理代币
- **用途**: 参与SNS治理投票

### 4. **任意ICRC-1标准代币**

- **标准**: 符合ICRC-1标准的任何代币
- **用途**: 查询任意ICRC-1代币的余额

## 🔧 使用方法

### 前端组件使用

```tsx
import { TokenBalanceDisplay } from "../components/TokenBalanceDisplay";

// 在组件中使用
<TokenBalanceDisplay isAuthenticated={isAuthenticated} />;
```

### 编程方式查询

```typescript
import { internetIdentityService } from "../services/InternetIdentityService";
import { TOKEN_CANISTER_IDS } from "../services/TokenBalanceService";

// 查询ICP余额
const icpBalance = await internetIdentityService.queryICPBalance();

// 查询ckBTC余额
const ckbtcBalance = await internetIdentityService.queryCkbtcBalance();

// 查询任意代币余额
const customBalance =
  await internetIdentityService.queryCurrentUserBalance(canisterId);

// 获取代币信息
const tokenInfo = await internetIdentityService.getTokenInfo(canisterId);

// 格式化余额显示
const formattedBalance = internetIdentityService.formatBalance(
  balance,
  tokenInfo.decimals,
);
```

## 🎯 功能特性

### 1. **实时余额查询**

- 直接从ledger canister获取最新余额
- 支持并行查询多个代币
- 自动错误处理和重试

### 2. **智能格式化**

- 根据代币精度自动格式化
- 支持不同小数位数的代币
- 友好的数字显示

### 3. **用户友好界面**

- 现代化的UI设计
- 支持深色模式
- 响应式布局
- 加载状态指示

### 4. **扩展性**

- 支持添加新的代币类型
- 模块化设计
- 易于维护和扩展

## 📱 界面展示

### 代币余额卡片

- 显示代币图标和名称
- 实时余额数据
- 刷新按钮
- 错误状态处理

### 自定义代币查询

- 输入Canister ID
- 查询任意ICRC-1代币
- 显示代币信息和余额

## 🔐 安全特性

### 1. **身份验证**

- 需要用户通过Internet Identity认证
- 使用delegation进行安全调用
- 验证用户身份和权限

### 2. **数据安全**

- 不存储用户私钥
- 所有查询都通过IC网络进行
- 支持匿名查询（只读操作）

### 3. **错误处理**

- 完善的错误处理机制
- 用户友好的错误提示
- 自动重试机制

## 🚀 未来计划

### 1. **更多代币支持**

- 添加更多主流代币
- 支持代币价格查询
- 集成价格预言机

### 2. **高级功能**

- 代币转账功能
- 交易历史查询
- 代币价格图表

### 3. **用户体验优化**

- 代币收藏功能
- 自定义代币列表
- 余额变化通知

## 📞 技术支持

如果在使用过程中遇到问题，请：

1. 检查网络连接
2. 确认用户已认证
3. 验证代币Canister ID是否正确
4. 查看浏览器控制台错误信息

## 🔗 相关链接

- [ICRC-1标准](https://github.com/dfinity/ICRC-1)
- [Internet Computer文档](https://internetcomputer.org/docs)
- [ICP Ledger](https://github.com/dfinity/ic)
- [ckBTC文档](https://internetcomputer.org/docs/current/developer-docs/integrations/bitcoin/ckbtc/)
