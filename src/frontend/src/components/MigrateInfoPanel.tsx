import React from "react";
import { useLanguage } from "../hooks/useLanguage";

export default function MigrateInfoPanel() {
  const { t } = useLanguage();
  return (
    <div className="rounded-xl bg-white p-4 shadow">
      <h3 className="mb-2 font-semibold">{t("Migration Benefits")}</h3>
      <ul className="space-y-2 text-sm text-gray-600">
        <li>📈 {t("Better yields with curated strategies")}</li>
        <li>🔒 {t("Non-custodial, secure migration")}</li>
        <li>⚡ {t("Fast and easy process")}</li>
        <li>🌐 {t("Support for multiple assets")}</li>
      </ul>
    </div>
  );
}
