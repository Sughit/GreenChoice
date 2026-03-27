export async function analyzeProduct(apiBase, payload) {
  console.log("[GreenChoice] sending to API:", `${apiBase}/analyze`, payload);

  const res = await fetch(`${apiBase}/analyze`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  console.log("[GreenChoice] raw API response:", text);

  if (!res.ok) throw new Error(text);

  return JSON.parse(text);
}