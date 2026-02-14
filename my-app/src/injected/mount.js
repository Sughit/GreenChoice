    import React from "react";
import { createRoot } from "react-dom/client";
import InjectedApp from "./InjectedApp.jsx";
import cssText from "../index.css?inline"; // Vite: import CSS as text

export function mountGreenChoice({ apiBase, payload }) {
  // container in page
  let host = document.getElementById("greenchoice-host");
  if (!host) {
    host = document.createElement("div");
    host.id = "greenchoice-host";
    host.style.position = "fixed";
    host.style.top = "90px";
    host.style.right = "16px";
    host.style.zIndex = "2147483647";
    document.documentElement.appendChild(host);
  }

  // Shadow DOM (izolează CSS)
  const shadow = host.shadowRoot || host.attachShadow({ mode: "open" });

  // Tailwind CSS inside shadow
  if (!shadow.getElementById("gc-style")) {
    const style = document.createElement("style");
    style.id = "gc-style";
    style.textContent = cssText;
    shadow.appendChild(style);
  }

  // React mount point
  let mountPoint = shadow.getElementById("gc-root");
  if (!mountPoint) {
    mountPoint = document.createElement("div");
    mountPoint.id = "gc-root";
    shadow.appendChild(mountPoint);
  }

  createRoot(mountPoint).render(<InjectedApp apiBase={apiBase} payload={payload} />);
}