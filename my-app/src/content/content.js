const API_BASE = import.meta.env.VITE_API_BASE;

// Extrage info produs (exact ca la tine)
function getProductPayload() {
  let title =
    document.querySelector("h1")?.textContent?.trim() || document.title;

  let description = "";
  let price = "";

  const scripts = document.querySelectorAll('script[type="application/ld+json"]');
  for (const script of scripts) {
    try {
      const json = JSON.parse(script.textContent);
      const product = Array.isArray(json)
        ? json.find((x) => x["@type"] === "Product")
        : json["@type"] === "Product"
        ? json
        : null;

      if (product) {
        if (product.name) title = product.name;
        if (product.description) description = product.description;
        if (product.offers?.price) price = product.offers.price;
      }
    } catch {}
  }

  if (!description) {
    description =
      document.querySelector(
        '[data-testid*="description"], .description, .product-description'
      )?.textContent?.trim() || document.body.innerText.slice(0, 3000);
  }

  if (!price) {
    price =
      document.querySelector('[data-testid*="price"], .price, .product-price')
        ?.textContent?.trim() || "";
  }

  return { url: location.href, title, description, price };
}

function isLikelyProductPage() {
  return document.querySelector("h1") && document.body.innerText.length > 200;
}

function injectConfigToPage(config) {
  // rulează în contextul paginii (nu în content script)
  const cfg = document.createElement("script");
  cfg.id = "greenchoice-config";
  cfg.textContent = `window.__GREENCHOICE__ = ${JSON.stringify(config)};`;
  (document.head || document.documentElement).appendChild(cfg);
  cfg.remove();
}

function injectMount() {
  if (document.getElementById("greenchoice-mount")) return;

  const s = document.createElement("script");
  s.id = "greenchoice-mount";
  s.type = "module";
  s.src = chrome.runtime.getURL("injected/mount.js");
  (document.head || document.documentElement).appendChild(s);
}

let lastConfig = null;

function sendConfig() {
  if (!lastConfig) return;
  window.postMessage(
    {
      source: "greenchoice",
      type: "GREENCHOICE_CONFIG",
      apiBase: lastConfig.apiBase,
      payload: lastConfig.payload,
    },
    "*"
  );
}

window.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.source !== "greenchoice") return;

  if (data.type === "GREENCHOICE_REQUEST_CONFIG") {
    sendConfig();
  }
});

async function run() {
  console.log("[GreenChoice] content script running");
  if (!isLikelyProductPage()) return;

  const payload = getProductPayload();
  lastConfig = { apiBase: API_BASE, payload };

  injectMount();

  // trimite o dată imediat (în caz că mount e deja gata)
  sendConfig();
}

if (document.readyState === "complete" || document.readyState === "interactive") {
  run();
} else {
  window.addEventListener("DOMContentLoaded", run);
}