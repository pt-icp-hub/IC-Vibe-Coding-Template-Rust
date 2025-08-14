import React from "react";

export const EnvTest: React.FC = () => {
  const envVars = {
    DFX_NETWORK: import.meta.env.DFX_NETWORK,
    CANISTER_ID_INTERNET_IDENTITY: import.meta.env
      .CANISTER_ID_INTERNET_IDENTITY,
    CANISTER_ID_BACKEND: import.meta.env.CANISTER_ID_BACKEND,
    // 添加更多环境变量用于调试
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
  };

  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <h3 className="mb-4 text-lg font-semibold">环境变量测试</h3>
      <pre className="rounded bg-gray-100 p-2 text-sm">
        {JSON.stringify(envVars, null, 2)}
      </pre>
      <div className="mt-4 text-sm text-gray-600">
        <p>
          II URL:{" "}
          {import.meta.env.CANISTER_ID_INTERNET_IDENTITY
            ? `http://${import.meta.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943/`
            : "undefined"}
        </p>
      </div>
    </div>
  );
};
