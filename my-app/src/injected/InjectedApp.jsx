import React, { useEffect, useState } from "react";
import { analyzeProduct } from "../api/client.js";

export default function InjectedApp({ apiBase, payload }) {
  const [state, setState] = useState({ status: "Analizez produsul…", data: null, error: null });

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await analyzeProduct(apiBase, payload);
        if (!alive) return;
        setState({
          status: data.ecoFound ? "Alternativă eco găsită ✅" : "Nu am găsit alternativă clară",
          data,
          error: null
        });
      } catch (e) {
        if (!alive) return;
        setState({ status: "Eroare la analiză ❌", data: null, error: String(e.message || e) });
      }
    })();
    return () => { alive = false; };
  }, [apiBase, payload?.url]);

  return (
    <div className="w-[320px] max-w-[calc(100vw-32px)] rounded-2xl border border-black/10 bg-white shadow-2xl font-sans">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="font-bold">GreenChoice</div>
        <button
          className="text-lg leading-none opacity-70 hover:opacity-100"
          onClick={() => document.getElementById("greenchoice-host")?.remove()}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <div className="px-4 pb-4 text-sm">
        <div className="text-xs text-black/60">{state.status}</div>

        {state.error && (
          <div className="mt-3 rounded-xl bg-black/5 p-3 text-xs">
            {state.error}
          </div>
        )}

        {state.data && (
          <div className="mt-3 space-y-2">
            <div className="rounded-xl bg-black/5 p-3">
              <div className="text-xs text-black/60">Scor eco</div>
              <div className="text-lg font-semibold">{state.data.score}/100</div>
            </div>

            <div className="rounded-xl bg-black/5 p-3">
              <div className="text-xs text-black/60">Materiale detectate</div>
              <div className="mt-1">
                {(state.data.materials?.length ? state.data.materials.join(", ") : "—")}
              </div>
            </div>

            {state.data.alt && (
              <a
                href={state.data.alt.url}
                target="_blank"
                rel="noreferrer"
                className="block rounded-xl border border-black/10 p-3 hover:bg-black/5"
              >
                <div className="text-xs text-black/60">Alternativă</div>
                <div className="mt-1 font-semibold">{state.data.alt.title}</div>
                {state.data.alt.note && <div className="mt-1 text-xs text-black/60">{state.data.alt.note}</div>}
                {state.data.impactReduction && (
                  <div className="mt-2 text-xs">Reducere estimată impact: <b>{state.data.impactReduction}</b></div>
                )}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}