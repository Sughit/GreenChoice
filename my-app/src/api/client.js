export async function analyzeProduct(apiBase, payload) {
  const res = await fetch(`${apiBase}/analyze`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}