import React from "react";
import { createRoot } from "react-dom/client";
import InjectedApp from "./InjectedApp.jsx";
import cssText from "../index.css?inline";

// Așteaptă config de la content script prin postMessage
function waitForConfig(timeoutMs = 6000) {
  return new Promise((resolve, reject) => {
    let done = false;

    function onMsg(event) {
      const data = event.data;
      if (!data || data.source !== "greenchoice") return;

      if (data.type === "GREENCHOICE_CONFIG") {
        done = true;
        window.removeEventListener("message", onMsg);
        clearTimeout(timer);
        resolve({ apiBase: data.apiBase, payload: data.payload });
      }
    }

    window.addEventListener("message", onMsg);

    // cere config-ul (după ce listener-ul e deja pus)
    window.postMessage(
      { source: "greenchoice", type: "GREENCHOICE_REQUEST_CONFIG" },
      "*"
    );

    const timer = setTimeout(() => {
      if (done) return;
      window.removeEventListener("message", onMsg);
      reject(new Error("GreenChoice config not received"));
    }, timeoutMs);
  });
}

async function mountGreenChoice() {
  try {
    const { apiBase, payload } = await waitForConfig();

    // Container în pagină
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

    // Shadow DOM
    const shadow =
      host.shadowRoot || host.attachShadow({ mode: "open" });

    // CSS în Shadow
    if (!shadow.getElementById("gc-style")) {
      const style = document.createElement("style");
      style.id = "gc-style";
      style.textContent = cssText;
      shadow.appendChild(style);
    }

    // Mount point React
    let mountPoint = shadow.getElementById("gc-root");
    if (!mountPoint) {
      mountPoint = document.createElement("div");
      mountPoint.id = "gc-root";
      shadow.appendChild(mountPoint);
    }

    createRoot(mountPoint).render(
      <InjectedApp apiBase={apiBase} payload={payload} />
    );
  } catch (err) {
    console.warn("[GreenChoice] mount failed:", err);
  }
}

// Pornește imediat
mountGreenChoice();