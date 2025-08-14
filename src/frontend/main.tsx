import React from "react";
import ReactDOM from "react-dom/client";
import AppWithLanguageProvider from "./src/App";
import "./src/index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <AppWithLanguageProvider />
  </React.StrictMode>,
);
