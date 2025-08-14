# 本地环境配置说明

dfx deploy internet_identity

dfx deploy backend

```
Deployed canisters.
URLs:
  Frontend canister via browser:
    internet_identity:
      - http://umunu-kh777-77774-qaaca-cai.localhost:4943/ (Recommended)
      - http://127.0.0.1:4943/?canisterId=umunu-kh777-77774-qaaca-cai (Legacy)
  Backend canister via Candid interface:
    backend: http://127.0.0.1:4943/?canisterId=u6s2n-gx777-77774-qaaba-cai&id=ulvla-h7777-77774-qaacq-cai
    basic_bitcoin: http://127.0.0.1:4943/?canisterId=u6s2n-gx777-77774-qaaba-cai&id=uzt4z-lp777-77774-qaabq-cai
    internet_identity: http://127.0.0.1:4943/?canisterId=u6s2n-gx777-77774-qaaba-cai&id=umunu-kh777-77774-qaaca-cai
```

## 环境变量配置

请在 `src/frontend/.env` 文件中设置以下环境变量：

```
VITE_DFX_NETWORK=local
VITE_USE_LOCAL_BACKEND=true
VITE_CANISTER_ID_BACKEND=ulvla-h7777-77774-qaacq-cai
VITE_II_CANISTER_ID=umunu-kh777-77774-qaaca-cai
```

请在 根目录下的`.evn`文件中设置一下环境变量

```
# DFX CANISTER ENVIRONMENT VARIABLES
DFX_VERSION='0.28.0'
DFX_NETWORK='local'
CANISTER_ID_INTERNET_IDENTITY='umunu-kh777-77774-qaaca-cai'
CANISTER_ID_BASIC_BITCOIN='uzt4z-lp777-77774-qaabq-cai'
CANISTER_ID_BACKEND='ulvla-h7777-77774-qaacq-cai'
CANISTER_ID='ulvla-h7777-77774-qaacq-cai'
CANISTER_CANDID_PATH='/Users/guoying/rust/icp_1/src/backend/backend.did'
# END DFX CANISTER ENVIRONMENT VARIABLES
```
