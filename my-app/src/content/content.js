import { mountGreenChoice } from "../injected/mount.js";

const API_BASE = "https://greenchoice-api.<subdomain>.workers.dev";

/**
 * Extrage informații din pagină folosind:
 * 1. Heuristici DOM
 * 2. JSON-LD (schema.org Product) dacă există
 */
function getProductPayload() {
  let title =
    document.querySelector("h1")?.textContent?.trim() ||
    document.title;

  let description = "";
  let price = "";

  // === Încearcă JSON-LD (cel mai corect) ===
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

  // === fallback DOM ===
  if (!description) {
    description =
      document.querySelector(
        '[data-testid*="description"], .description, .product-description'
      )?.textContent?.trim() ||
      document.body.innerText.slice(0, 3000);
  }

  if (!price) {
    price =
      document.querySelector(
        '[data-testid*="price"], .price, .product-price'
      )?.textContent?.trim() || "";
  }

  return {
    url: location.href,
    title,
    description,
    price,
  };
}

/**
 * Rulează doar dacă pare pagină de produs
 */
function isLikelyProductPage() {
  return (
    document.querySelector("h1") &&
    document.body.innerText.length > 200
  );
}

async function run() {
  if (!isLikelyProductPage()) return;

  const payload = getProductPayload();

  // mic delay ca să nu se injecteze înainte de layout stabil
  setTimeout(() => {
    mountGreenChoice({
      apiBase: API_BASE,
      payload,
    });
  }, 600);
}

// Rulează când pagina e gata
if (document.readyState === "complete" || document.readyState === "interactive") {
  run();
} else {
  window.addEventListener("DOMContentLoaded", run);
}