"use client";
import { useState } from "react";

export default function Chat() {
  const [q, setQ] = useState("");
  const [a, setA] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask() {
    if (!q.trim()) return;
    setLoading(true);
    setA("");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/chat`,
      {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ query: q, k: 4 })
      }
    );
    const json = await res.json();
    setA(json.answer || JSON.stringify(json));
    setLoading(false);
  }

  return (
    <div style={{maxWidth: 720, margin: "40px auto", padding: 16}}>
      <h1>Grounded QA Demo</h1>
      <textarea
        value={q}
        onChange={(e)=>setQ(e.target.value)}
        rows={4}
        style={{width: "100%"}}
        placeholder="Ask a question…"
      />
      <div style={{marginTop: 8}}>
        <button onClick={ask} disabled={loading}>{loading ? "Thinking…" : "Ask"}</button>
      </div>
      {a && <pre style={{whiteSpace: "pre-wrap", marginTop: 16}}>{a}</pre>}
    </div>
  );
}
