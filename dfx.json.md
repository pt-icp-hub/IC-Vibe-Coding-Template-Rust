# dfx.json 配置文件说明

这个文件详细解释了 dfx.json 中每个字段的含义和作用。

## 顶级字段

### `canisters`

定义项目中所有canister的配置。每个canister都有自己的配置选项。

### `output_env_file`

指定dfx生成的环境变量文件路径，部署后canister的ID等信息会写入这个文件。

### `version`

配置文件的版本号，用于向后兼容。

### `dfx`

指定使用的dfx工具版本，确保项目使用特定版本的dfx。当前使用的是最新版本0.27.0。

## Canister 配置详解

### llm canister

```json
"llm": {
  "type": "pull",
  "id": "w36hm-eqaaa-aaaal-qr76a-cai"
}
```

- **type**: "pull" 表示这是一个外部canister，通过canister ID引用
- **id**: 具体的canister ID，指向已部署的LLM服务

### backend canister

```json
"backend": {
  "dependencies": ["llm"],
  "candid": "src/backend/backend.did",
  "package": "backend",
  "type": "custom",
  "shrink": true,
  "gzip": true,
  "wasm": "target/wasm32-unknown-unknown/release/backend.wasm",
  "build": ["bash ./scripts/generate-candid.sh backend"],
  "metadata": [
    {
      "name": "candid:service"
    }
  ]
}
```

- **dependencies**: 声明依赖llm canister，部署时会先确保llm可用
- **candid**: Candid接口定义文件的路径
- **package**: 对应Cargo.toml中的包名
- **type**: "custom" 表示自定义canister类型，需要手动构建
- **shrink**: 优化wasm文件大小，移除未使用的代码
- **gzip**: 压缩wasm文件以减少存储空间
- **wasm**: 编译后的wasm文件路径
- **build**: 构建命令数组，部署前执行
- **metadata**: 元数据配置，这里指定candid服务信息

### frontend canister

```json
"frontend": {
  "dependencies": ["backend"],
  "type": "assets",
  "source": ["src/frontend/dist/"]
}
```

- **dependencies**: 依赖backend canister
- **type**: "assets" 表示静态资源canister，用于托管前端文件
- **source**: 静态资源的源目录路径

## 常见的其他字段

虽然当前项目中没有使用，但还有一些常见字段：

- **pre_upgrade/post_upgrade**: 升级前后的钩子脚本
- **init_arg**: canister初始化参数
- **declarations**: 类型声明生成配置
- **env**: 环境变量配置
- **remote**: 远程canister配置
- **specified_id**: 指定特定的canister ID

## 版本管理

建议定期更新dfx版本以获得最新功能和修复：

- 查看已安装版本：`dfxvm list`
- 安装最新版本：`dfxvm install latest`
- 设置默认版本：`dfxvm default <version>`

## 部署流程

当运行 `dfx deploy` 时，dfx会：

1. 按照依赖关系顺序部署canister
2. 对于backend canister，先运行build命令
3. 编译生成wasm文件
4. 如果设置了shrink和gzip，会优化文件大小
5. 部署到IC网络
6. 更新环境变量文件
