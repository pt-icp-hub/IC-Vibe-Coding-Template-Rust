import React, { useState } from "react";
import { useLanguage } from "../hooks/useLanguage";

const migrateAssets = [
  { id: "1", name: "ETH", amount: 2.5, icon: "🪙" },
  { id: "2", name: "USDC", amount: 1200, icon: "💵" },
  { id: "3", name: "BTC", amount: 0.15, icon: "🟠" },
];

export default function MigrateStepper() {
  const { t } = useLanguage();
  const steps = [
    t("Step 1: Select Assets"),
    t("Step 2: Confirm Migration"),
    t("Step 3: Migration Result"),
  ];
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [migrated, setMigrated] = useState(false);

  const handleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleMigrate = () => {
    setMigrated(true);
    setStep(2);
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow">
      {/* 步骤条 */}
      <div className="mb-6 flex items-center">
        {steps.map((label, idx) => (
          <React.Fragment key={label}>
            <div
              className={`flex items-center ${idx < step ? "text-blue-500" : idx === step ? "font-bold text-blue-600" : "text-gray-400"}`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${idx <= step ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-100"}`}
              >
                {idx + 1}
              </div>
              <span className="ml-2 text-sm">{label}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className="mx-2 h-0.5 flex-1 bg-gray-200" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* 步骤内容 */}
      {step === 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">{t("Select Assets")}</h2>
          {migrateAssets.length === 0 ? (
            <div className="text-gray-400">{t("No assets to migrate")}</div>
          ) : (
            <ul>
              {migrateAssets.map((asset) => (
                <li
                  key={asset.id}
                  className={`mb-2 flex cursor-pointer items-center justify-between rounded-lg border p-3 transition ${
                    selected.includes(asset.id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => handleSelect(asset.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{asset.icon}</span>
                    <span className="font-medium">{asset.name}</span>
                  </div>
                  <span className="text-gray-500">{asset.amount}</span>
                  <input
                    type="checkbox"
                    checked={selected.includes(asset.id)}
                    readOnly
                    className="accent-blue-500"
                  />
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 flex justify-end">
            <button
              className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-5 py-2 font-semibold text-white shadow transition hover:from-blue-600 hover:to-purple-600"
              disabled={selected.length === 0}
              onClick={() => setStep(1)}
            >
              {t("Continue")}
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold">
            {t("Confirm Migration")}
          </h2>
          <ul>
            {migrateAssets
              .filter((a) => selected.includes(a.id))
              .map((asset) => (
                <li key={asset.id} className="mb-2 flex items-center gap-3">
                  <span className="text-xl">{asset.icon}</span>
                  <span>{asset.name}</span>
                  <span className="text-gray-500">{asset.amount}</span>
                </li>
              ))}
          </ul>
          <div className="mt-6 flex justify-between">
            <button
              className="rounded-lg bg-gray-100 px-5 py-2 font-semibold text-gray-700 shadow transition hover:bg-gray-200"
              onClick={() => setStep(0)}
            >
              {t("Back")}
            </button>
            <button
              className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-5 py-2 font-semibold text-white shadow transition hover:from-blue-600 hover:to-purple-600"
              onClick={handleMigrate}
            >
              {t("Start Migration")}
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="text-center">
          {migrated ? (
            <>
              <div className="mb-4 text-5xl">✅</div>
              <h2 className="mb-2 text-lg font-semibold">
                {t("Migration Complete!")}
              </h2>
              <p className="mb-4 text-gray-500">
                {t("Your assets have been migrated successfully.")}
              </p>
              <button
                className="rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 px-5 py-2 font-semibold text-white shadow transition hover:from-blue-600 hover:to-purple-600"
                onClick={() => setStep(0)}
              >
                {t("Done")}
              </button>
            </>
          ) : (
            <div className="text-gray-400">{t("No migration performed.")}</div>
          )}
        </div>
      )}
    </div>
  );
}
