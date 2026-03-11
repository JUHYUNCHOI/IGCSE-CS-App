import React from "react";
import { C } from "../constants";

export function bold(t) {
  if (!t) return null;
  return t.split(/\*\*(.*?)\*\*/g).map((p, i) => i % 2 ? <strong key={i} style={{ color: C.purple, fontWeight: 700 }}>{p}</strong> : p);
}

// ── SPLIT EXPLAIN INTO PAGES ──
export function splitExplainPages(lines) {
  const pages = [];
  let current = [];
  for (const line of lines) {
    if (line.startsWith("━━━") && current.length > 0) {
      pages.push(current);
      current = [];
    }
    current.push(line);
  }
  if (current.length > 0) pages.push(current);
  return pages.map(p => {
    while (p.length && p[0] === "") p.shift();
    while (p.length && p[p.length - 1] === "") p.pop();
    return p;
  });
}

// ── EXPLAIN RENDERER ──
export function renderExplain(lines, color) {
  const groups = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    // Empty line → spacer
    if (line === "") { groups.push({ type: "spacer" }); i++; continue; }
    // Section header: ━━━ ... ━━━
    if (line.startsWith("━━━")) { groups.push({ type: "header", text: line.replace(/━/g, "").trim() }); i++; continue; }
    // Indented block: group consecutive lines starting with 2+ spaces
    if (/^ {2,}/.test(line)) {
      const block = [];
      while (i < lines.length && /^ {2,}/.test(lines[i])) { block.push(lines[i]); i++; }
      groups.push({ type: "code", lines: block });
      continue;
    }
    // Warning line
    if (line.includes("⚠")) { groups.push({ type: "warn", text: line }); i++; continue; }
    // Formula line
    if (line.startsWith("📐")) { groups.push({ type: "formula", text: line }); i++; continue; }
    // Result line
    if (line.startsWith("→")) { groups.push({ type: "result", text: line }); i++; continue; }
    // Wrong/right markers
    if (line.startsWith("✕")) { groups.push({ type: "wrong", text: line }); i++; continue; }
    if (line.startsWith("✓")) { groups.push({ type: "right", text: line }); i++; continue; }
    // Numbered step ①②③
    if (/^[①②③④⑤⑥]/.test(line)) { groups.push({ type: "step", text: line }); i++; continue; }
    // Bullet
    if (line.startsWith("•")) { groups.push({ type: "bullet", text: line.slice(1).trim() }); i++; continue; }
    // Default text
    groups.push({ type: "text", text: line });
    i++;
  }

  const hc = color; // header color
  return groups.map((g, idx) => {
    switch (g.type) {
      case "spacer":
        return <div key={idx} style={{ height: 10 }} />;
      case "header":
        return (
          <div key={idx} style={{ background: `${hc}12`, borderLeft: `3px solid ${hc}`, borderRadius: "0 8px 8px 0", padding: "8px 12px", margin: "6px 0 8px", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: hc, flexShrink: 0 }} />
            <span style={{ fontSize: 14, fontWeight: 800, color: C.text, lineHeight: 1.5 }}>{bold(g.text)}</span>
          </div>
        );
      case "code":
        return (
          <div key={idx} style={{ background: "#F1F0FB", borderRadius: 10, padding: "10px 14px", margin: "4px 0", fontFamily: "'SF Mono',Menlo,monospace", fontSize: 12.5, lineHeight: 1.8, color: C.text, overflowX: "auto" }}>
            {g.lines.map((l, j) => <div key={j}>{bold(l)}</div>)}
          </div>
        );
      case "warn":
        return (
          <div key={idx} style={{ background: C.orangeLight, borderLeft: `3px solid ${C.orange}`, borderRadius: "0 8px 8px 0", padding: "8px 12px", margin: "6px 0", fontSize: 13, lineHeight: 1.7, color: "#78350F", fontWeight: 600 }}>
            {bold(g.text)}
          </div>
        );
      case "formula":
        return (
          <div key={idx} style={{ background: C.blueLight, borderLeft: `3px solid ${C.blue}`, borderRadius: "0 8px 8px 0", padding: "8px 12px", margin: "6px 0", fontSize: 13, lineHeight: 1.7, color: "#1E3A5F", fontWeight: 600 }}>
            {bold(g.text)}
          </div>
        );
      case "result":
        return (
          <div key={idx} style={{ background: C.greenLight, borderRadius: 8, padding: "6px 12px", margin: "3px 0", fontSize: 13, lineHeight: 1.7, color: "#065F46", fontWeight: 600 }}>
            {bold(g.text)}
          </div>
        );
      case "wrong":
        return (
          <div key={idx} style={{ background: C.redLight, borderRadius: 8, padding: "6px 12px", margin: "2px 0", fontSize: 13, lineHeight: 1.7, color: "#991B1B", fontWeight: 500 }}>
            {bold(g.text)}
          </div>
        );
      case "right":
        return (
          <div key={idx} style={{ background: C.greenLight, borderRadius: 8, padding: "6px 12px", margin: "2px 0", fontSize: 13, lineHeight: 1.7, color: "#065F46", fontWeight: 500 }}>
            {bold(g.text)}
          </div>
        );
      case "step":
        return (
          <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "4px 0", fontSize: 13.5, lineHeight: 1.7, color: C.text }}>
            <span style={{ background: `${hc}18`, color: hc, width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0, marginTop: 2 }}>{g.text[0]}</span>
            <span>{bold(g.text.slice(1).trim())}</span>
          </div>
        );
      case "bullet":
        return (
          <div key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 8, paddingLeft: 6, fontSize: 13.5, lineHeight: 1.7, color: C.text }}>
            <span style={{ color: hc, fontSize: 18, lineHeight: "24px", flexShrink: 0 }}>•</span>
            <span>{bold(g.text)}</span>
          </div>
        );
      default:
        return (
          <div key={idx} style={{ fontSize: 13.5, lineHeight: 1.75, color: C.text, padding: "1px 0" }}>
            {bold(g.text)}
          </div>
        );
    }
  });
}
