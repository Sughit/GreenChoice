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

function injectMount() {
  if (document.getElementById("greenchoice-mount")) return;

  const s = document.createElement("script");
  s.id = "greenchoice-mount";
  s.type = "module";
  s.src = chrome.runtime.getURL("injected/mount.js");
  (document.head || document.documentElement).appendChild(s);
}

async function run() {
  if (!isLikelyProductPage()) return;

  const payload = getProductPayload();

  window.__GREENCHOICE__ = {
    apiBase: API_BASE,
    payload,
  };

  setTimeout(injectMount, 300);
}

if (document.readyState === "complete" || document.readyState === "interactive") {
  run();
} else {
  window.addEventListener("DOMContentLoaded", run);
}