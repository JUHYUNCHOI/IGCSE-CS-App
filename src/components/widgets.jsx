import { useState } from "react";
import { C, F, btnS } from "../constants";

const bitBox = (val, onClick, accent, size = 36) => (
  <div onClick={onClick} style={{ width: size, height: size, borderRadius: 8, background: val ? accent : "#fff", color: val ? "#fff" : C.text, border: `2px solid ${val ? accent : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: size > 30 ? 15 : 12, fontWeight: 800, fontFamily: "monospace", cursor: onClick ? "pointer" : "default", transition: "all .15s", userSelect: "none" }}>
    {val}
  </div>
);

export function PlaceValueTable() {
  const [bits, setBits] = useState([0,0,0,0,0,0,0,0]);
  const labels = [128,64,32,16,8,4,2,1];
  const toggle = i => setBits(b => b.map((v,j) => j===i ? (v?0:1) : v));
  const total = bits.reduce((s,b,i) => s + b*labels[i], 0);
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 14, border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.purple, marginBottom: 8 }}>직접 눌러보기! 비트를 클릭하면 0↔1 전환</div>
      <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
        {labels.map((l,i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 10, color: C.light, fontWeight: 700, marginBottom: 4 }}>{l}</div>
            {bitBox(bits[i], () => toggle(i), C.purple)}
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 10, fontSize: 18, fontWeight: 800, color: C.purple }}>
        = {total} <span style={{ fontSize: 12, color: C.sub, fontWeight: 500 }}>(10진수)</span>
      </div>
    </div>
  );
}

export function DenaryToBinaryConverter() {
  const [input, setInput] = useState("");
  const [steps, setSteps] = useState([]);
  const [showing, setShowing] = useState(0);
  const run = () => {
    let n = parseInt(input);
    if (isNaN(n) || n < 0 || n > 255) return;
    const s = [];
    if (n === 0) { s.push({ n: 0, q: 0, r: 0 }); }
    else { while (n > 0) { s.push({ n, q: Math.floor(n/2), r: n%2 }); n = Math.floor(n/2); } }
    setSteps(s); setShowing(0);
    let i = 0;
    const iv = setInterval(() => { i++; if (i >= s.length) clearInterval(iv); setShowing(i); }, 400);
  };
  const result = steps.map(s => s.r).reverse();
  const padded = result.length < 8 ? Array(8-result.length).fill(0).concat(result) : result;
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 14, border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.purple, marginBottom: 8 }}>10진수를 입력하고 변환 과정을 확인해봐!</div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
        <input value={input} onChange={e => setInput(e.target.value.replace(/\D/g,"").slice(0,3))} placeholder="0~255" style={{ width: 70, padding: "8px 10px", borderRadius: 8, border: `2px solid ${C.border}`, fontSize: 15, fontFamily: "monospace", textAlign: "center", outline: "none" }} />
        <button onClick={run} style={{ ...btnS, background: C.purple }}>변환 시작</button>
      </div>
      {steps.length > 0 && (
        <div style={{ background: "#F1F0FB", borderRadius: 8, padding: 10, fontFamily: "monospace", fontSize: 13, lineHeight: 2 }}>
          {steps.map((s,i) => i <= showing && (
            <div key={i} style={{ opacity: 1, color: C.text }}>
              {s.n} ÷ 2 = {s.q} 나머지 <span style={{ color: C.purple, fontWeight: 800, fontSize: 15 }}>{s.r}</span>
            </div>
          ))}
          {showing >= steps.length - 1 && (
            <div style={{ marginTop: 8, padding: "6px 10px", background: C.greenLight, borderRadius: 8, fontWeight: 700, color: "#065F46" }}>
              → 결과: {padded.join("")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function BinaryAdder() {
  const [a, setA] = useState([0,1,1,0,1,0,1,1]);
  const [b, setB] = useState([0,0,1,1,1,0,0,1]);
  const [result, setResult] = useState(null);
  const [step, setStep] = useState(-1);
  const toggleA = i => setA(v => v.map((x,j) => j===i?(x?0:1):x));
  const toggleB = i => setB(v => v.map((x,j) => j===i?(x?0:1):x));
  const add = () => {
    setResult(null); setStep(-1);
    const res = Array(8).fill(0);
    const carries = Array(9).fill(0);
    for (let i = 7; i >= 0; i--) {
      const sum = a[i] + b[i] + carries[i+1];
      res[i] = sum % 2;
      carries[i] = Math.floor(sum / 2);
    }
    const overflow = carries[0] === 1;
    setResult({ res, carries, overflow });
    let s = 8;
    const iv = setInterval(() => { s--; if (s < 0) clearInterval(iv); setStep(s); }, 300);
  };
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 14, border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.blue, marginBottom: 8 }}>비트를 클릭해서 숫자를 바꿔보고, 더하기!</div>
      {result && (
        <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 4 }}>
          <div style={{ width: 32, fontSize: 9, color: C.light, textAlign: "center" }}>올림</div>
          {result.carries.slice(0,8).map((c,i) => (
            <div key={i} style={{ width: 32, textAlign: "center", fontSize: 11, fontWeight: 700, color: c ? C.orange : "transparent", fontFamily: "monospace", transition: "all .2s", opacity: step <= i ? 1 : 0 }}>{c}</div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 4, alignItems: "center" }}>
        <div style={{ width: 32 }} />
        {a.map((v,i) => <div key={i}>{bitBox(v, () => toggleA(i), C.blue, 32)}</div>)}
      </div>
      <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 4, alignItems: "center" }}>
        <div style={{ width: 32, textAlign: "center", fontWeight: 800, color: C.blue, fontSize: 16 }}>+</div>
        {b.map((v,i) => <div key={i}>{bitBox(v, () => toggleB(i), C.blue, 32)}</div>)}
      </div>
      <div style={{ display: "flex", justifyContent: "center", margin: "6px 0" }}>
        <button onClick={add} style={{ ...btnS, background: C.blue }}>더하기</button>
      </div>
      {result && (
        <>
          <div style={{ borderTop: `2px solid ${C.blue}`, margin: "4px 18px" }} />
          <div style={{ display: "flex", gap: 4, justifyContent: "center", marginTop: 4, alignItems: "center" }}>
            <div style={{ width: 32 }} />
            {result.res.map((v,i) => (
              <div key={i} style={{ width: 32, height: 32, borderRadius: 8, background: step <= i ? C.blueLight : "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, fontFamily: "monospace", color: C.text, transition: "all .2s", border: `2px solid ${step <= i ? C.blue : C.border}` }}>{step <= i ? v : ""}</div>
            ))}
          </div>
          {result.overflow && step <= 0 && (
            <div style={{ textAlign: "center", marginTop: 8, padding: "4px 10px", background: C.redLight, borderRadius: 8, color: "#991B1B", fontWeight: 700, fontSize: 12 }}>
              ⚠ 오버플로우! 9비트 발생 — 8비트에 담을 수 없음
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function BitShifter() {
  const [bits, setBits] = useState([0,0,1,1,0,1,0,0]);
  const [lost, setLost] = useState(null);
  const toggle = i => setBits(b => b.map((v,j) => j===i?(v?0:1):v));
  const val = bits.reduce((s,b,i) => s + b*(1<<(7-i)), 0);
  const shiftLeft = () => {
    setLost(bits[0] === 1 ? "left" : null);
    setBits(b => [...b.slice(1), 0]);
  };
  const shiftRight = () => {
    setLost(bits[7] === 1 ? "right" : null);
    setBits(b => [0, ...b.slice(0,7)]);
  };
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 14, border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.blue, marginBottom: 8 }}>비트를 설정하고 시프트해봐!</div>
      <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 8 }}>
        {bits.map((v,i) => <div key={i}>{bitBox(v, () => toggle(i), C.blue, 36)}</div>)}
      </div>
      <div style={{ textAlign: "center", fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 8 }}>
        = {val} <span style={{ fontSize: 11, color: C.sub }}>(10진수)</span>
      </div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        <button onClick={shiftLeft} style={{ ...btnS, background: C.blue }}>← 왼쪽 시프트 (×2)</button>
        <button onClick={shiftRight} style={{ ...btnS, background: C.blue }}>오른쪽 시프트 (÷2) →</button>
      </div>
      {lost && (
        <div style={{ textAlign: "center", marginTop: 6, fontSize: 11, color: C.red, fontWeight: 600 }}>
          ⚠ {lost === "left" ? "왼쪽" : "오른쪽"} 비트 1이 사라짐 — 데이터 손실!
        </div>
      )}
    </div>
  );
}

export function PixelGrid() {
  const [depth, setDepth] = useState(4);
  const numColors = Math.pow(2, depth);
  const palette = Array.from({length: numColors}, (_,i) => {
    const h = (i / numColors) * 360;
    return `hsl(${h},70%,60%)`;
  });
  if (depth === 1) { palette[0] = "#000"; palette[1] = "#fff"; }
  const grid = Array.from({length: 64}, (_,i) => palette[i % numColors]);
  const fileSize = 8 * 8 * depth;
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 14, border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#8B5CF6", marginBottom: 8 }}>색 깊이를 바꿔보고 차이를 확인해봐!</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: C.sub, fontWeight: 600 }}>색 깊이:</span>
        {[1,2,4,8].map(d => (
          <button key={d} onClick={() => setDepth(d)} style={{ padding: "4px 10px", borderRadius: 8, background: depth===d ? "#8B5CF6" : "#fff", color: depth===d ? "#fff" : C.text, border: `1px solid ${depth===d ? "#8B5CF6" : C.border}`, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: F }}>
            {d}bit = {Math.pow(2,d)}색
          </button>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(8,1fr)", gap: 2, width: "fit-content", margin: "0 auto" }}>
        {grid.map((c,i) => (
          <div key={i} style={{ width: 28, height: 28, borderRadius: 4, background: c, border: "1px solid rgba(0,0,0,.1)" }} />
        ))}
      </div>
      <div style={{ textAlign: "center", marginTop: 8, fontSize: 12, color: C.sub }}>
        8×8 픽셀 × {depth}비트 = <strong style={{ color: "#8B5CF6" }}>{fileSize}비트</strong> ({(fileSize/8)}바이트)
      </div>
    </div>
  );
}

export function RLEDemo() {
  const original = [
    {c:"#EF4444",n:"빨"},{c:"#EF4444",n:"빨"},{c:"#EF4444",n:"빨"},{c:"#EF4444",n:"빨"},{c:"#EF4444",n:"빨"},
    {c:"#3B82F6",n:"파"},{c:"#3B82F6",n:"파"},{c:"#3B82F6",n:"파"},
    {c:"#10B981",n:"초"},{c:"#10B981",n:"초"},{c:"#10B981",n:"초"},{c:"#10B981",n:"초"},
  ];
  const [compressed, setCompressed] = useState(false);
  const groups = [];
  let cur = null;
  for (const item of original) {
    if (cur && cur.c === item.c) cur.count++;
    else { cur = { c: item.c, n: item.n, count: 1 }; groups.push(cur); }
  }
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 14, border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.green, marginBottom: 8 }}>RLE 압축을 직접 확인해봐!</div>
      <div style={{ fontSize: 11, color: C.sub, marginBottom: 6 }}>{compressed ? "압축 후 (RLE)" : "압축 전 (원본)"}</div>
      <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 10, transition: "all .3s" }}>
        {!compressed ? original.map((item,i) => (
          <div key={i} style={{ width: 36, height: 36, borderRadius: 8, background: item.c, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700 }}>{item.n}</div>
        )) : groups.map((g,i) => (
          <div key={i} style={{ height: 36, borderRadius: 8, background: g.c, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, padding: "0 12px", gap: 4 }}>
            {g.n}×{g.count}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={() => setCompressed(!compressed)} style={{ ...btnS, background: C.green }}>
          {compressed ? "원본 보기" : "압축하기!"}
        </button>
        <span style={{ fontSize: 11, color: C.sub }}>
          {compressed ? `${groups.length * 2}개 데이터 (색+횟수)` : `${original.length}개 데이터`}
          {compressed && <span style={{ color: C.green, fontWeight: 700 }}> — {Math.round((1 - (groups.length*2)/original.length)*100)}% 줄었어!</span>}
        </span>
      </div>
    </div>
  );
}

export function BinaryToDenaryDemo() {
  const bits = [1,1,0,1,0,1,1,0];
  const powers = [7,6,5,4,3,2,1,0];
  const vals = powers.map(p => Math.pow(2, p));
  const [showVals, setShowVals] = useState(false);
  const sum = bits.reduce((a, b, i) => a + b * vals[i], 0);
  const activeSum = bits.map((b, i) => b ? vals[i] : 0).filter(v => v > 0);
  return (
    <div style={{ background: "#f8f7ff", borderRadius: 12, padding: 14, border: `1px solid ${C.border}` }}>
      <div style={{ color: C.purple, fontWeight: 700, fontSize: 13, marginBottom: 10, fontFamily: F }}>예시) 11010110 → 10진수로 바꾸기</div>
      <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 4 }}>
        {bits.map((b, i) => (
          <div key={i} style={{ width: 38, textAlign: "center" }}>
            <div style={{ fontSize: 10, color: C.light, fontWeight: 600, fontFamily: "monospace" }}>
              {showVals ? vals[i] : `2${String.fromCharCode(8304 + powers[i])}`}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 4, justifyContent: "center", marginBottom: 8 }}>
        {bits.map((b, i) => (
          <div key={i} style={{ width: 38, height: 38, borderRadius: 8, background: b ? C.purple : "#f3f4f6", color: b ? "#fff" : C.light, border: `2px solid ${b ? C.purple : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, fontFamily: "monospace" }}>
            {b}
          </div>
        ))}
      </div>
      <div style={{ textAlign: "center", fontFamily: "monospace", fontSize: 13, color: C.text, marginBottom: 8, lineHeight: 1.8 }}>
        {showVals
          ? <>{activeSum.join(" + ")} = <span style={{ color: C.purple, fontWeight: 800, fontSize: 18 }}>{sum}</span></>
          : <>{bits.map((b, i) => `${b}×2${String.fromCharCode(8304 + powers[i])}`).join(" + ")}</>
        }
      </div>
      <div style={{ textAlign: "center" }}>
        <button onClick={() => setShowVals(!showVals)} style={{ ...btnS, background: showVals ? C.purple : `${C.purple}15`, color: showVals ? "#fff" : C.purple, border: `1px solid ${C.purple}40`, fontSize: 12 }}>
          {showVals ? "2의 거듭제곱으로 보기" : "값으로 계산하기 →"}
        </button>
      </div>
    </div>
  );
}

// ── SVG DIAGRAMS ──
export function HexGroupDiagram() {
  const bits = ["1","1","0","1","0","1","1","0"];
  const w = 340, h = 150, bw = 32, gap = 6, startX = (w - (bw * 8 + gap * 7)) / 2;
  return (
    <div style={{ background: "#f8f7ff", borderRadius: 12, padding: 14, border: `1px solid ${C.border}`, textAlign: "center" }}>
      <div style={{ color: C.purple, fontWeight: 700, fontSize: 13, marginBottom: 8, fontFamily: F }}>4비트씩 묶으면 → 16진수 한 자리!</div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ maxWidth: w }}>
        {bits.map((b, i) => {
          const x = startX + i * (bw + gap);
          const isLeft = i < 4;
          return (<g key={i}>
            <rect x={x} y={10} width={bw} height={bw} rx={6} fill={isLeft ? "#7C3AED" : "#3B82F6"} />
            <text x={x + bw/2} y={10 + bw/2 + 5} textAnchor="middle" fill="#fff" fontSize={14} fontWeight={800} fontFamily="monospace">{b}</text>
          </g>);
        })}
        {/* brackets */}
        <path d={`M${startX} 48 L${startX} 56 L${startX + 4*(bw+gap) - gap} 56 L${startX + 4*(bw+gap) - gap} 48`} fill="none" stroke="#7C3AED" strokeWidth={2}/>
        <path d={`M${startX + 4*(bw+gap)} 48 L${startX + 4*(bw+gap)} 56 L${startX + 8*(bw+gap) - gap} 56 L${startX + 8*(bw+gap) - gap} 48`} fill="none" stroke="#3B82F6" strokeWidth={2}/>
        {/* arrows */}
        <line x1={startX + 2*(bw+gap) - gap/2} y1={58} x2={startX + 2*(bw+gap) - gap/2} y2={80} stroke="#7C3AED" strokeWidth={2} markerEnd="url(#arr1)"/>
        <line x1={startX + 6*(bw+gap) - gap/2} y1={58} x2={startX + 6*(bw+gap) - gap/2} y2={80} stroke="#3B82F6" strokeWidth={2} markerEnd="url(#arr2)"/>
        <defs>
          <marker id="arr1" markerWidth={8} markerHeight={6} refX={8} refY={3} orient="auto"><path d="M0,0 L8,3 L0,6" fill="#7C3AED"/></marker>
          <marker id="arr2" markerWidth={8} markerHeight={6} refX={8} refY={3} orient="auto"><path d="M0,0 L8,3 L0,6" fill="#3B82F6"/></marker>
        </defs>
        {/* hex values */}
        <text x={startX + 2*(bw+gap) - gap/2} y={100} textAnchor="middle" fontSize={13} fontFamily="monospace" fill="#7C3AED" fontWeight={700}>1101 = D (13)</text>
        <text x={startX + 6*(bw+gap) - gap/2} y={100} textAnchor="middle" fontSize={13} fontFamily="monospace" fill="#3B82F6" fontWeight={700}>0110 = 6</text>
        {/* result */}
        <rect x={w/2 - 50} y={112} width={100} height={30} rx={8} fill="#10B981" />
        <text x={w/2} y={132} textAnchor="middle" fill="#fff" fontSize={15} fontWeight={800} fontFamily="monospace">= D6</text>
      </svg>
    </div>
  );
}

export function SoundWaveDiagram() {
  const w = 360, h = 180;
  const samples = 8;
  const points = [];
  for (let i = 0; i <= 40; i++) {
    const x = 40 + (i / 40) * (w - 60);
    const y = h / 2 - Math.sin(i / 40 * Math.PI * 2.5) * 55;
    points.push(`${x},${y}`);
  }
  const samplePts = [];
  for (let i = 0; i < samples; i++) {
    const t = i / (samples - 1);
    const x = 40 + t * (w - 60);
    const y = h / 2 - Math.sin(t * Math.PI * 2.5) * 55;
    samplePts.push({ x, y });
  }
  return (
    <div style={{ background: "#f0fdf4", borderRadius: 12, padding: 14, border: `1px solid ${C.border}`, textAlign: "center" }}>
      <div style={{ color: "#059669", fontWeight: 700, fontSize: 13, marginBottom: 8, fontFamily: F }}>사운드 샘플링: 파형을 일정 간격으로 측정!</div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ maxWidth: w }}>
        {/* axes */}
        <line x1={35} y1={h/2} x2={w-10} y2={h/2} stroke="#ccc" strokeWidth={1} strokeDasharray="4"/>
        <line x1={38} y1={15} x2={38} y2={h-15} stroke="#ccc" strokeWidth={1}/>
        <text x={12} y={h/2 + 4} fontSize={10} fill="#999" fontFamily={F}>진폭</text>
        <text x={w-30} y={h/2 + 14} fontSize={10} fill="#999" fontFamily={F}>시간</text>
        {/* wave */}
        <polyline points={points.join(" ")} fill="none" stroke="#10B981" strokeWidth={2.5} opacity={0.5}/>
        {/* sample lines & dots */}
        {samplePts.map((p, i) => (
          <g key={i}>
            <line x1={p.x} y1={h/2} x2={p.x} y2={p.y} stroke="#7C3AED" strokeWidth={1.5} strokeDasharray="3"/>
            <circle cx={p.x} cy={p.y} r={5} fill="#7C3AED"/>
            <text x={p.x} y={h - 8} textAnchor="middle" fontSize={9} fill="#7C3AED" fontWeight={700} fontFamily="monospace">{Math.round(((h/2 - p.y) / 55) * 127 + 128)}</text>
          </g>
        ))}
        {/* labels */}
        <text x={w/2} y={h - 0} textAnchor="middle" fontSize={10} fill="#666" fontFamily={F}>↑ 각 측정값을 2진수로 저장</text>
      </svg>
    </div>
  );
}

export function TwosComplementDiagram() {
  const orig =  [0,0,1,0,0,0,1,1];
  const inv =   [1,1,0,1,1,1,0,0];
  const result = [1,1,0,1,1,1,0,1];
  const w = 340, bw = 30, gap = 4, startX = (w - (bw * 8 + gap * 7)) / 2;
  const row = (bits, y, label, color) => (
    <g>
      <text x={startX - 8} y={y + bw/2 + 4} textAnchor="end" fontSize={11} fill="#666" fontWeight={600} fontFamily={F}>{label}</text>
      {bits.map((b, i) => {
        const x = startX + i * (bw + gap);
        return (<g key={i}>
          <rect x={x} y={y} width={bw} height={bw} rx={5} fill={b ? color : "#f3f4f6"} stroke={color} strokeWidth={1.5}/>
          <text x={x+bw/2} y={y+bw/2+5} textAnchor="middle" fill={b ? "#fff" : "#333"} fontSize={13} fontWeight={800} fontFamily="monospace">{b}</text>
        </g>);
      })}
    </g>
  );
  return (
    <div style={{ background: "#fef3c7", borderRadius: 12, padding: 14, border: `1px solid ${C.border}`, textAlign: "center" }}>
      <div style={{ color: "#D97706", fontWeight: 700, fontSize: 13, marginBottom: 8, fontFamily: F }}>-35를 2의 보수로 만들기 (8비트)</div>
      <svg viewBox={`0 0 ${w} 160`} width="100%" style={{ maxWidth: w }}>
        {row(orig, 5, "35 =", "#6B7280")}
        <text x={w/2} y={50} textAnchor="middle" fontSize={11} fill="#D97706" fontWeight={700} fontFamily={F}>↓ 모든 비트 반전 (0→1, 1→0)</text>
        {row(inv, 58, "반전", "#D97706")}
        <text x={w/2} y={103} textAnchor="middle" fontSize={11} fill="#7C3AED" fontWeight={700} fontFamily={F}>↓ +1 더하기</text>
        {row(result, 112, "-35 =", "#7C3AED")}
      </svg>
    </div>
  );
}

export function LossyLosslessDiagram() {
  const w = 340, h = 100;
  return (
    <div style={{ background: "#fef2f2", borderRadius: 12, padding: 14, border: `1px solid ${C.border}`, textAlign: "center" }}>
      <div style={{ color: "#DC2626", fontWeight: 700, fontSize: 13, marginBottom: 8, fontFamily: F }}>손실 vs 비손실 압축 비교</div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ maxWidth: w }}>
        {/* Lossy side */}
        <rect x={10} y={10} width={150} height={35} rx={8} fill="#FCA5A5"/>
        <text x={85} y={32} textAnchor="middle" fontSize={11} fontWeight={700} fill="#991B1B" fontFamily={F}>손실 (Lossy)</text>
        <text x={85} y={58} textAnchor="middle" fontSize={10} fill="#666" fontFamily={F}>파일 작음 / 복원 불가</text>
        <text x={85} y={73} textAnchor="middle" fontSize={10} fill="#666" fontFamily={F}>예: JPEG, MP3</text>
        <text x={85} y={90} textAnchor="middle" fontSize={16} fontFamily={F}>🖼️🎵</text>
        {/* Lossless side */}
        <rect x={180} y={10} width={150} height={35} rx={8} fill="#93C5FD"/>
        <text x={255} y={32} textAnchor="middle" fontSize={11} fontWeight={700} fill="#1E3A8A" fontFamily={F}>비손실 (Lossless)</text>
        <text x={255} y={58} textAnchor="middle" fontSize={10} fill="#666" fontFamily={F}>파일 큼 / 완벽 복원</text>
        <text x={255} y={73} textAnchor="middle" fontSize={10} fill="#666" fontFamily={F}>예: PNG, FLAC</text>
        <text x={255} y={90} textAnchor="middle" fontSize={16} fontFamily={F}>📄🔊</text>
      </svg>
    </div>
  );
}

export function ASCIILookup() {
  const [char, setChar] = useState("");
  const code = char ? char.charCodeAt(0) : null;
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 14, border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#8B5CF6", marginBottom: 8 }}>문자를 입력하면 코드를 보여줄게!</div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <input value={char} onChange={e => setChar(e.target.value.slice(-1))} placeholder="A" maxLength={1} style={{ width: 50, padding: "8px", borderRadius: 8, border: `2px solid ${C.border}`, fontSize: 24, fontFamily: "monospace", textAlign: "center", outline: "none" }} />
        {code !== null && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={{ background: C.purpleLight, padding: "6px 12px", borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: C.sub }}>ASCII/Unicode</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.purple, fontFamily: "monospace" }}>{code}</div>
            </div>
            <div style={{ background: C.blueLight, padding: "6px 12px", borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: C.sub }}>Binary</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: C.blue, fontFamily: "monospace" }}>{code.toString(2).padStart(code < 128 ? 7 : 16, "0")}</div>
            </div>
            <div style={{ background: C.greenLight, padding: "6px 12px", borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: C.sub }}>Hex</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: C.green, fontFamily: "monospace" }}>{code.toString(16).toUpperCase()}</div>
            </div>
          </div>
        )}
      </div>
      {code !== null && code < 128 && <div style={{ fontSize: 11, color: C.sub, marginTop: 6 }}>이 문자는 ASCII 범위 (0~127)에 포함돼!</div>}
      {code !== null && code >= 128 && <div style={{ fontSize: 11, color: "#DC2626", marginTop: 6, fontWeight: 600 }}>이 문자는 ASCII로 표현 불가 → Unicode 필요!</div>}
    </div>
  );
}

// ── PHASE 2 WIDGETS: Data Transmission ──
export function PacketDiagram() {
  const w = 360, h = 80;
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 14, border: `1px solid ${C.border}`, textAlign: "center" }}>
      <div style={{ color: C.blue, fontWeight: 700, fontSize: 13, marginBottom: 8, fontFamily: F }}>패킷 구조 (Packet Structure)</div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ maxWidth: w }}>
        <rect x={5} y={15} width={80} height={50} rx={6} fill="#DBEAFE" stroke={C.blue} strokeWidth={1.5}/>
        <text x={45} y={36} textAnchor="middle" fontSize={10} fontWeight={700} fill={C.blue} fontFamily={F}>Header</text>
        <text x={45} y={52} textAnchor="middle" fontSize={8} fill="#666" fontFamily={F}>송/수신 IP,</text>
        <text x={45} y={61} textAnchor="middle" fontSize={8} fill="#666" fontFamily={F}>순서번호</text>
        <rect x={90} y={15} width={180} height={50} rx={6} fill="#D1FAE5" stroke={C.green} strokeWidth={1.5}/>
        <text x={180} y={36} textAnchor="middle" fontSize={10} fontWeight={700} fill="#065F46" fontFamily={F}>Payload (데이터)</text>
        <text x={180} y={52} textAnchor="middle" fontSize={8} fill="#666" fontFamily={F}>실제 전송할 내용</text>
        <rect x={275} y={15} width={80} height={50} rx={6} fill="#FEE2E2" stroke={C.red} strokeWidth={1.5}/>
        <text x={315} y={36} textAnchor="middle" fontSize={10} fontWeight={700} fill="#991B1B" fontFamily={F}>Trailer</text>
        <text x={315} y={52} textAnchor="middle" fontSize={8} fill="#666" fontFamily={F}>오류 검출</text>
      </svg>
    </div>
  );
}

export function TransmissionModesDiagram() {
  const w = 340, h = 130;
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 14, border: `1px solid ${C.border}`, textAlign: "center" }}>
      <div style={{ color: C.blue, fontWeight: 700, fontSize: 13, marginBottom: 8, fontFamily: F }}>직렬 vs 병렬 전송</div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ maxWidth: w }}>
        {/* Serial */}
        <text x={10} y={15} fontSize={10} fontWeight={700} fill={C.blue} fontFamily={F}>직렬 (Serial)</text>
        <rect x={10} y={22} width={40} height={25} rx={4} fill="#DBEAFE"/><text x={30} y={38} textAnchor="middle" fontSize={8} fill="#333" fontFamily={F}>송신</text>
        <line x1={55} y1={34} x2={135} y2={34} stroke={C.blue} strokeWidth={2}/>
        <text x={95} y={30} textAnchor="middle" fontSize={7} fill="#666" fontFamily={F}>1비트씩</text>
        <polygon points="133,30 140,34 133,38" fill={C.blue}/>
        <rect x={140} y={22} width={40} height={25} rx={4} fill="#DBEAFE"/><text x={160} y={38} textAnchor="middle" fontSize={8} fill="#333" fontFamily={F}>수신</text>
        {/* Parallel */}
        <text x={10} y={70} fontSize={10} fontWeight={700} fill={C.purple} fontFamily={F}>병렬 (Parallel)</text>
        <rect x={10} y={77} width={40} height={40} rx={4} fill="#EDE9FE"/><text x={30} y={100} textAnchor="middle" fontSize={8} fill="#333" fontFamily={F}>송신</text>
        {[0,1,2,3].map(i => <line key={i} x1={55} y1={82+i*9} x2={135} y2={82+i*9} stroke={C.purple} strokeWidth={1.5}/>)}
        <text x={95} y={78} textAnchor="middle" fontSize={7} fill="#666" fontFamily={F}>여러 비트 동시</text>
        {[0,1,2,3].map(i => <polygon key={i} points={`133,${80+i*9} 138,${82+i*9} 133,${84+i*9}`} fill={C.purple}/>)}
        <rect x={140} y={77} width={40} height={40} rx={4} fill="#EDE9FE"/><text x={160} y={100} textAnchor="middle" fontSize={8} fill="#333" fontFamily={F}>수신</text>
        {/* Comparison */}
        <rect x={200} y={15} width={130} height={105} rx={8} fill="#F5F3FF"/>
        <text x={265} y={33} textAnchor="middle" fontSize={9} fontWeight={700} fill={C.text} fontFamily={F}>비교</text>
        <text x={210} y={50} fontSize={8} fill="#333" fontFamily={F}>직렬: 느리지만 장거리 가능</text>
        <text x={210} y={65} fontSize={8} fill="#333" fontFamily={F}>간섭 적음, 저렴</text>
        <text x={210} y={85} fontSize={8} fill="#333" fontFamily={F}>병렬: 빠르지만 단거리만</text>
        <text x={210} y={100} fontSize={8} fill="#333" fontFamily={F}>간섭 많음, 비쌈</text>
      </svg>
    </div>
  );
}

export function ParityChecker() {
  const [bits, setBits] = useState([1,0,1,1,0,0,1]);
  const [parityType, setParityType] = useState("even");
  const toggle = i => setBits(b => b.map((v,j) => j===i ? (v?0:1) : v));
  const ones = bits.reduce((s,b) => s+b, 0);
  const parityBit = parityType === "even" ? (ones % 2 === 0 ? 0 : 1) : (ones % 2 === 1 ? 0 : 1);
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 14, border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.blue, marginBottom: 8 }}>패리티 비트 계산기 — 비트를 클릭해봐!</div>
      <div style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 8, flexWrap: "wrap" }}>
        <button onClick={() => setParityType(p => p === "even" ? "odd" : "even")} style={{ ...btnS, background: C.blueLight, color: C.blue, fontSize: 11, padding: "5px 10px" }}>
          {parityType === "even" ? "짝수 패리티 (Even)" : "홀수 패리티 (Odd)"}
        </button>
      </div>
      <div style={{ display: "flex", gap: 4, alignItems: "center", justifyContent: "center" }}>
        {bits.map((b,i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9, color: C.light, fontWeight: 600 }}>D{i+1}</div>
            {bitBox(b, () => toggle(i), C.blue, 32)}
          </div>
        ))}
        <div style={{ width: 2, height: 30, background: C.border, margin: "0 4px" }}/>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 9, color: C.orange, fontWeight: 700 }}>P</div>
          {bitBox(parityBit, null, C.orange, 32)}
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: C.sub }}>
        1의 개수: {ones} → 패리티 비트 = <strong style={{ color: C.orange }}>{parityBit}</strong> → 총 1의 수: {ones + parityBit} ({parityType === "even" ? "짝수" : "홀수"})
      </div>
    </div>
  );
}

// ── Phase 3 WIDGETS ──

export function CPUDiagram() {
  const w = 360, h = 220;
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 14, border: `1px solid ${C.border}`, textAlign: "center" }}>
      <div style={{ color: C.purple, fontWeight: 700, fontSize: 13, marginBottom: 8, fontFamily: F }}>CPU 구조</div>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ maxWidth: w }}>
        {/* CPU box */}
        <rect x={10} y={10} width={240} height={150} rx={10} fill="#F5F3FF" stroke={C.purple} strokeWidth={2} strokeDasharray="5,3"/>
        <text x={130} y={28} textAnchor="middle" fontSize={11} fontWeight={800} fill={C.purple} fontFamily={F}>CPU (중앙처리장치)</text>
        {/* CU */}
        <rect x={25} y={38} width={100} height={50} rx={6} fill="#DBEAFE" stroke={C.blue} strokeWidth={1.5}/>
        <text x={75} y={58} textAnchor="middle" fontSize={10} fontWeight={700} fill="#1E3A5F" fontFamily={F}>CU</text>
        <text x={75} y={72} textAnchor="middle" fontSize={7} fill="#666" fontFamily={F}>제어장치</text>
        {/* ALU */}
        <rect x={140} y={38} width={100} height={50} rx={6} fill="#D1FAE5" stroke={C.green} strokeWidth={1.5}/>
        <text x={190} y={58} textAnchor="middle" fontSize={10} fontWeight={700} fill="#065F46" fontFamily={F}>ALU</text>
        <text x={190} y={72} textAnchor="middle" fontSize={7} fill="#666" fontFamily={F}>산술/논리 연산</text>
        {/* Registers */}
        <rect x={25} y={98} width={215} height={52} rx={6} fill="#FEF3C7" stroke={C.orange} strokeWidth={1.5}/>
        <text x={132} y={113} textAnchor="middle" fontSize={9} fontWeight={700} fill="#92400E" fontFamily={F}>Registers (레지스터)</text>
        {["PC","MAR","MDR","CIR","ACC"].map((r,i) => (
          <g key={r}>
            <rect x={30+i*42} y={119} width={36} height={22} rx={4} fill="#fff" stroke="#D97706" strokeWidth={1}/>
            <text x={48+i*42} y={134} textAnchor="middle" fontSize={8} fontWeight={700} fill="#92400E" fontFamily={F}>{r}</text>
          </g>
        ))}
        {/* System Bus */}
        <rect x={265} y={30} width={85} height={130} rx={8} fill="#FEE2E2" stroke={C.red} strokeWidth={1.5}/>
        <text x={307} y={48} textAnchor="middle" fontSize={9} fontWeight={700} fill="#991B1B" fontFamily={F}>System Bus</text>
        {[{t:"Address",y:65,c:"#DC2626"},{t:"Data",y:90,c:"#2563EB"},{t:"Control",y:115,c:"#059669"}].map(b => (
          <g key={b.t}>
            <rect x={275} y={b.y-10} width={65} height={20} rx={4} fill="#fff" stroke={b.c} strokeWidth={1}/>
            <text x={307} y={b.y+4} textAnchor="middle" fontSize={8} fontWeight={600} fill={b.c} fontFamily={F}>{b.t}</text>
          </g>
        ))}
        {/* Arrows CPU → Bus */}
        <line x1={250} y1={65} x2={275} y2={65} stroke={C.purple} strokeWidth={1.5}/>
        <polygon points="273,62 278,65 273,68" fill={C.purple}/>
        <line x1={250} y1={90} x2={275} y2={90} stroke={C.purple} strokeWidth={1.5}/>
        <polygon points="273,87 278,90 273,93" fill={C.purple}/>
        {/* Memory */}
        <rect x={265} y={170} width={85} height={40} rx={6} fill="#EDE9FE" stroke={C.purple} strokeWidth={1.5}/>
        <text x={307} y={190} textAnchor="middle" fontSize={9} fontWeight={700} fill={C.purple} fontFamily={F}>Memory</text>
        <text x={307} y={202} textAnchor="middle" fontSize={7} fill="#666" fontFamily={F}>(RAM)</text>
        <line x1={307} y1={160} x2={307} y2={170} stroke={C.purple} strokeWidth={1.5}/>
        <polygon points="304,168 307,173 310,168" fill={C.purple}/>
      </svg>
    </div>
  );
}

export function FDECycleDiagram() {
  const [step, setStep] = useState(0);
  const steps = [
    { label: "Fetch", color: C.blue, desc: "PC의 주소 → MAR → 메모리에서 명령어 가져옴 → MDR → CIR, PC+1" },
    { label: "Decode", color: C.orange, desc: "CIR의 명령어를 CU가 해석 → 어떤 연산? 어떤 데이터?" },
    { label: "Execute", color: C.green, desc: "ALU가 연산 수행 → 결과를 ACC에 저장" },
  ];
  const cur = steps[step];
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 14, border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.purple, marginBottom: 8 }}>FDE 사이클 — 단계를 클릭해봐!</div>
      <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 10 }}>
        {steps.map((s,i) => (
          <button key={i} onClick={() => setStep(i)} style={{ ...btnS, background: step === i ? s.color : `${s.color}20`, color: step === i ? "#fff" : s.color, fontSize: 12, padding: "7px 14px", border: `2px solid ${s.color}` }}>
            {s.label}
          </button>
        ))}
      </div>
      <div style={{ background: `${cur.color}12`, borderLeft: `3px solid ${cur.color}`, borderRadius: "0 8px 8px 0", padding: "10px 14px" }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: cur.color, marginBottom: 4 }}>{cur.label}</div>
        <div style={{ fontSize: 12, color: C.text, lineHeight: 1.7 }}>{cur.desc}</div>
      </div>
      <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: C.sub }}>
        Fetch → Decode → Execute → Fetch → ... (무한 반복)
      </div>
    </div>
  );
}

export function LogicGateSimulator() {
  const [gate, setGate] = useState("AND");
  const [a, setA] = useState(0);
  const [b, setB] = useState(0);
  const gates = {
    AND: (a,b) => a & b,
    OR: (a,b) => a | b,
    NOT: (a) => a ? 0 : 1,
    NAND: (a,b) => (a & b) ? 0 : 1,
    NOR: (a,b) => (a | b) ? 0 : 1,
    XOR: (a,b) => a ^ b,
  };
  const isNot = gate === "NOT";
  const output = isNot ? gates[gate](a) : gates[gate](a,b);
  const gateList = ["AND","OR","NOT","NAND","NOR","XOR"];
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 14, border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.green, marginBottom: 8 }}>논리 게이트 시뮬레이터</div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
        {gateList.map(g => (
          <button key={g} onClick={() => setGate(g)} style={{ ...btnS, background: gate === g ? C.green : C.greenLight, color: gate === g ? "#fff" : "#065F46", fontSize: 11, padding: "5px 10px" }}>
            {g}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 9, color: C.sub, fontWeight: 600 }}>Input A</div>
            {bitBox(a, () => setA(v => v ? 0 : 1), C.blue, 38)}
          </div>
          {!isNot && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 9, color: C.sub, fontWeight: 600 }}>Input B</div>
              {bitBox(b, () => setB(v => v ? 0 : 1), C.blue, 38)}
            </div>
          )}
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, color: C.green }}>{gate}</div>
        <div style={{ fontSize: 24, color: C.sub }}>→</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 9, color: C.sub, fontWeight: 600 }}>Output</div>
          {bitBox(output, null, output ? C.green : C.red, 42)}
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: 8, fontSize: 11, color: C.sub }}>
        {isNot ? `NOT ${a} = ${output}` : `${a} ${gate} ${b} = ${output}`}
      </div>
    </div>
  );
}

export function TruthTableBuilder() {
  const [gate, setGate] = useState("AND");
  const gates = {
    AND: (a,b) => a & b,
    OR: (a,b) => a | b,
    NOT: (a) => a ? 0 : 1,
    NAND: (a,b) => (a & b) ? 0 : 1,
    NOR: (a,b) => (a | b) ? 0 : 1,
    XOR: (a,b) => a ^ b,
  };
  const isNot = gate === "NOT";
  const rows = isNot ? [[0],[1]] : [[0,0],[0,1],[1,0],[1,1]];
  const hd = { padding: "6px 12px", fontSize: 12, fontWeight: 700, borderBottom: `2px solid ${C.green}`, color: C.text, textAlign: "center" };
  const td = { padding: "6px 12px", fontSize: 13, fontFamily: "monospace", textAlign: "center", borderBottom: `1px solid ${C.border}` };
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 14, border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.green, marginBottom: 8 }}>진리표 생성기 — 게이트를 골라봐!</div>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 10 }}>
        {["AND","OR","NOT","NAND","NOR","XOR"].map(g => (
          <button key={g} onClick={() => setGate(g)} style={{ ...btnS, background: gate === g ? C.green : C.greenLight, color: gate === g ? "#fff" : "#065F46", fontSize: 11, padding: "5px 10px" }}>
            {g}
          </button>
        ))}
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", borderRadius: 8, overflow: "hidden" }}>
        <thead>
          <tr style={{ background: C.greenLight }}>
            <th style={hd}>A</th>
            {!isNot && <th style={hd}>B</th>}
            <th style={{ ...hd, color: C.green }}>Output</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r,i) => {
            const out = isNot ? gates[gate](r[0]) : gates[gate](r[0],r[1]);
            return (
              <tr key={i} style={{ background: i % 2 ? "#FAFAFA" : "#fff" }}>
                <td style={td}>{r[0]}</td>
                {!isNot && <td style={td}>{r[1]}</td>}
                <td style={{ ...td, fontWeight: 700, color: out ? C.green : C.red }}>{out}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Phase 4 WIDGETS ──

export function CompilerVsInterpreter() {
  const [mode, setMode] = useState("compiler");
  const data = {
    compiler: { label: "컴파일러 (Compiler)", color: C.blue, steps: ["전체 소스 코드를 한 번에 기계어로 번역", "실행 파일(.exe) 생성", "번역 후에는 소스 코드 없이도 실행 가능", "실행 속도 빠름 (이미 번역됨)", "오류를 모두 찾은 뒤 한꺼번에 보고"] },
    interpreter: { label: "인터프리터 (Interpreter)", color: C.orange, steps: ["소스 코드를 한 줄씩 읽어서 즉시 실행", "실행 파일을 생성하지 않음", "실행할 때마다 매번 번역 필요", "실행 속도 느림 (매번 번역)", "오류 발견 즉시 중단 → 디버깅 쉬움"] },
  };
  const d = data[mode];
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 14, border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.purple, marginBottom: 8 }}>컴파일러 vs 인터프리터</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
        <button onClick={() => setMode("compiler")} style={{ ...btnS, background: mode === "compiler" ? C.blue : C.blueLight, color: mode === "compiler" ? "#fff" : C.blue, fontSize: 11 }}>Compiler</button>
        <button onClick={() => setMode("interpreter")} style={{ ...btnS, background: mode === "interpreter" ? C.orange : C.orangeLight, color: mode === "interpreter" ? "#fff" : "#92400E", fontSize: 11 }}>Interpreter</button>
      </div>
      <div style={{ background: `${d.color}10`, borderLeft: `3px solid ${d.color}`, borderRadius: "0 8px 8px 0", padding: "10px 14px" }}>
        <div style={{ fontWeight: 800, fontSize: 13, color: d.color, marginBottom: 6 }}>{d.label}</div>
        {d.steps.map((s,i) => (
          <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", fontSize: 12, lineHeight: 1.7, color: C.text }}>
            <span style={{ color: d.color, fontWeight: 800, flexShrink: 0 }}>•</span>{s}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TopologyDiagram() {
  const [topo, setTopo] = useState("star");
  const w = 220, h = 160;
  const topos = {
    star: { label: "Star", color: C.blue, pros: "노드 장애가 다른 노드에 영향 없음, 쉬운 관리", cons: "중앙 스위치 고장 시 전체 마비" },
    bus: { label: "Bus", color: C.green, pros: "설치 쉽고 케이블 적게 필요", cons: "메인 케이블 끊기면 전체 마비, 충돌 잦음" },
    mesh: { label: "Mesh", color: C.purple, pros: "높은 안정성 (경로 다양), 빠른 전송", cons: "설치 비용 높음, 케이블 많이 필요" },
  };
  const t = topos[topo];
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 14, border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.purple, marginBottom: 8 }}>네트워크 토폴로지</div>
      <div style={{ display: "flex", gap: 4, marginBottom: 10 }}>
        {Object.entries(topos).map(([k,v]) => (
          <button key={k} onClick={() => setTopo(k)} style={{ ...btnS, background: topo === k ? v.color : `${v.color}20`, color: topo === k ? "#fff" : v.color, fontSize: 11, padding: "5px 10px" }}>
            {v.label}
          </button>
        ))}
      </div>
      <div style={{ textAlign: "center" }}>
        <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ maxWidth: w }}>
          {topo === "star" && (<>
            <circle cx={110} cy={80} r={14} fill={C.blueLight} stroke={C.blue} strokeWidth={2}/>
            <text x={110} y={84} textAnchor="middle" fontSize={8} fontWeight={700} fill={C.blue} fontFamily={F}>Switch</text>
            {[[40,30],[180,30],[40,130],[180,130],[110,150]].map(([x,y],i) => (
              <g key={i}><line x1={110} y1={80} x2={x} y2={y} stroke={C.blue} strokeWidth={1}/><circle cx={x} cy={y} r={10} fill="#fff" stroke={C.blue} strokeWidth={1.5}/><text x={x} y={y+3} textAnchor="middle" fontSize={7} fill="#333" fontFamily={F}>PC{i+1}</text></g>
            ))}
          </>)}
          {topo === "bus" && (<>
            <line x1={20} y1={80} x2={200} y2={80} stroke={C.green} strokeWidth={3}/>
            <text x={110} y={75} textAnchor="middle" fontSize={8} fill={C.green} fontWeight={600} fontFamily={F}>Main Cable</text>
            {[40,80,120,160].map((x,i) => (
              <g key={i}><line x1={x} y1={80} x2={x} y2={110} stroke={C.green} strokeWidth={1}/><circle cx={x} cy={120} r={10} fill="#fff" stroke={C.green} strokeWidth={1.5}/><text x={x} y={123} textAnchor="middle" fontSize={7} fill="#333" fontFamily={F}>PC{i+1}</text></g>
            ))}
          </>)}
          {topo === "mesh" && (<>
            {[[60,30],[160,30],[60,130],[160,130]].map(([x,y],i,arr) => {
              const lines = [];
              for (let j=i+1; j<arr.length; j++) lines.push(<line key={`${i}-${j}`} x1={x} y1={y} x2={arr[j][0]} y2={arr[j][1]} stroke={C.purple} strokeWidth={1} opacity={0.5}/>);
              return (<g key={i}>{lines}<circle cx={x} cy={y} r={10} fill="#fff" stroke={C.purple} strokeWidth={1.5}/><text x={x} y={y+3} textAnchor="middle" fontSize={7} fill="#333" fontFamily={F}>PC{i+1}</text></g>);
            })}
          </>)}
        </svg>
      </div>
      <div style={{ marginTop: 6, fontSize: 11 }}>
        <div style={{ color: C.green }}>✓ {t.pros}</div>
        <div style={{ color: C.red }}>✕ {t.cons}</div>
      </div>
    </div>
  );
}

// ── Phase 5 WIDGETS ──

export function SortingVisualizer() {
  const [algo, setAlgo] = useState("bubble");
  const [arr, setArr] = useState([5,2,8,1,9,3]);
  const [steps, setSteps] = useState([]);
  const [step, setStep] = useState(-1);
  const reset = () => { setArr([5,2,8,1,9,3]); setSteps([]); setStep(-1); };
  const run = () => {
    const a = [...arr];
    const s = [];
    if (algo === "bubble") {
      for (let i=0; i<a.length-1; i++) for (let j=0; j<a.length-1-i; j++) {
        s.push({ arr: [...a], comparing: [j,j+1], desc: `${a[j]} vs ${a[j+1]}` });
        if (a[j]>a[j+1]) { [a[j],a[j+1]]=[a[j+1],a[j]]; s.push({ arr:[...a], swapped:[j,j+1], desc: `swap!` }); }
      }
    } else {
      const merge = (a,l,r) => {
        if (l>=r) return;
        const m = Math.floor((l+r)/2);
        merge(a,l,m); merge(a,m+1,r);
        const L=a.slice(l,m+1), R=a.slice(m+1,r+1);
        let i=0,j=0,k=l;
        while(i<L.length&&j<R.length) { s.push({arr:[...a],comparing:[l+i,m+1+j],desc:`${L[i]} vs ${R[j]}`}); if(L[i]<=R[j])a[k++]=L[i++]; else a[k++]=R[j++]; s.push({arr:[...a],swapped:[k-1],desc:'place'}); }
        while(i<L.length){a[k++]=L[i++]; s.push({arr:[...a],swapped:[k-1],desc:'place'});}
        while(j<R.length){a[k++]=R[j++]; s.push({arr:[...a],swapped:[k-1],desc:'place'});}
      };
      merge(a,0,a.length-1);
    }
    s.push({ arr:[...a], done: true, desc: "완료!" });
    setSteps(s); setStep(0);
  };
  const cur = step >= 0 && steps[step] ? steps[step] : { arr, comparing: [], swapped: [] };
  const maxVal = Math.max(...cur.arr);
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 14, border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.purple, marginBottom: 8 }}>정렬 시각화</div>
      <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
        <button onClick={() => { setAlgo("bubble"); reset(); }} style={{ ...btnS, background: algo === "bubble" ? C.purple : C.purpleLight, color: algo === "bubble" ? "#fff" : C.purple, fontSize: 11, padding: "5px 10px" }}>Bubble</button>
        <button onClick={() => { setAlgo("merge"); reset(); }} style={{ ...btnS, background: algo === "merge" ? C.purple : C.purpleLight, color: algo === "merge" ? "#fff" : C.purple, fontSize: 11, padding: "5px 10px" }}>Merge</button>
        <button onClick={run} style={{ ...btnS, fontSize: 11, padding: "5px 10px" }}>▶ 시작</button>
        <button onClick={reset} style={{ ...btnS, background: C.border, color: C.text, fontSize: 11, padding: "5px 10px" }}>초기화</button>
      </div>
      <div style={{ display: "flex", gap: 4, alignItems: "flex-end", justifyContent: "center", height: 80 }}>
        {cur.arr.map((v,i) => {
          const isCmp = cur.comparing?.includes(i);
          const isSwp = cur.swapped?.includes(i);
          return (
            <div key={i} style={{ width: 30, height: `${(v/maxVal)*70}px`, background: cur.done ? C.green : isSwp ? C.red : isCmp ? C.orange : C.purpleLight, borderRadius: "4px 4px 0 0", display: "flex", alignItems: "flex-end", justifyContent: "center", transition: "all .2s" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: cur.done || isSwp || isCmp ? "#fff" : C.purple, marginBottom: 2 }}>{v}</span>
            </div>
          );
        })}
      </div>
      {steps.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <button onClick={() => setStep(Math.max(0,step-1))} style={{ ...btnS, fontSize: 10, padding: "4px 8px", background: C.purpleLight, color: C.purple }}>◀</button>
          <span style={{ fontSize: 11, color: C.sub }}>{step+1}/{steps.length} — {cur.desc}</span>
          <button onClick={() => setStep(Math.min(steps.length-1,step+1))} style={{ ...btnS, fontSize: 10, padding: "4px 8px" }}>▶</button>
        </div>
      )}
    </div>
  );
}

export function SearchVisualizer() {
  const sorted = [2,5,8,12,16,23,38,56,72,91];
  const [target, setTarget] = useState("23");
  const [algo, setAlgo] = useState("linear");
  const [steps, setSteps] = useState([]);
  const [step, setStep] = useState(-1);
  const run = () => {
    const t = parseInt(target);
    if (isNaN(t)) return;
    const s = [];
    if (algo === "linear") {
      for (let i=0; i<sorted.length; i++) {
        s.push({ idx: i, found: sorted[i]===t, desc: `[${i}] = ${sorted[i]} ${sorted[i]===t ? "→ 찾았다!" : "→ 아님, 다음"}` });
        if (sorted[i]===t) break;
      }
      if (!s.some(x=>x.found)) s.push({ idx: -1, found: false, desc: "찾지 못함!" });
    } else {
      let lo=0, hi=sorted.length-1;
      while(lo<=hi) {
        const mid=Math.floor((lo+hi)/2);
        s.push({ lo, hi, mid, found: sorted[mid]===t, desc: `mid=[${mid}]=${sorted[mid]} ${sorted[mid]===t?"→ 찾았다!":sorted[mid]<t?"→ 작으니까 오른쪽":"→ 크니까 왼쪽"}` });
        if (sorted[mid]===t) break;
        if (sorted[mid]<t) lo=mid+1; else hi=mid-1;
      }
      if (!s.some(x=>x.found)) s.push({ lo:-1, hi:-1, mid:-1, found:false, desc:"찾지 못함!" });
    }
    setSteps(s); setStep(0);
  };
  const cur = step >= 0 && steps[step] ? steps[step] : null;
  return (
    <div style={{ background: "#fff", borderRadius: 12, padding: 14, border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.blue, marginBottom: 8 }}>검색 시각화</div>
      <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
        <button onClick={() => { setAlgo("linear"); setSteps([]); setStep(-1); }} style={{ ...btnS, background: algo === "linear" ? C.blue : C.blueLight, color: algo === "linear" ? "#fff" : C.blue, fontSize: 11, padding: "5px 10px" }}>Linear</button>
        <button onClick={() => { setAlgo("binary"); setSteps([]); setStep(-1); }} style={{ ...btnS, background: algo === "binary" ? C.blue : C.blueLight, color: algo === "binary" ? "#fff" : C.blue, fontSize: 11, padding: "5px 10px" }}>Binary</button>
        <input value={target} onChange={e=>setTarget(e.target.value.replace(/\D/g,"").slice(0,3))} style={{ width: 50, padding: "4px 8px", borderRadius: 6, border: `1px solid ${C.border}`, fontSize: 12, fontFamily: "monospace", textAlign: "center" }} />
        <button onClick={run} style={{ ...btnS, fontSize: 11, padding: "5px 10px" }}>▶ 검색</button>
      </div>
      <div style={{ display: "flex", gap: 3, justifyContent: "center" }}>
        {sorted.map((v,i) => {
          let bg = "#fff", bdr = C.border, col = C.text;
          if (cur) {
            if (algo === "linear") {
              if (cur.idx === i && cur.found) { bg = C.greenLight; bdr = C.green; col = "#065F46"; }
              else if (cur.idx === i) { bg = C.orangeLight; bdr = C.orange; }
              else if (steps.slice(0,step).some(s=>s.idx===i)) { bg = "#F3F4F6"; col = C.light; }
            } else {
              if (cur.mid === i && cur.found) { bg = C.greenLight; bdr = C.green; col = "#065F46"; }
              else if (cur.mid === i) { bg = C.orangeLight; bdr = C.orange; }
              else if (i >= cur.lo && i <= cur.hi) { bg = C.blueLight; bdr = C.blue; }
              else { bg = "#F3F4F6"; col = C.light; }
            }
          }
          return (
            <div key={i} style={{ width: 28, height: 28, borderRadius: 6, background: bg, border: `1.5px solid ${bdr}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: col, fontFamily: "monospace" }}>{v}</div>
          );
        })}
      </div>
      {steps.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
          <button onClick={() => setStep(Math.max(0,step-1))} style={{ ...btnS, fontSize: 10, padding: "4px 8px", background: C.blueLight, color: C.blue }}>◀</button>
          <span style={{ fontSize: 11, color: C.sub }}>{step+1}/{steps.length} — {cur?.desc}</span>
          <button onClick={() => setStep(Math.min(steps.length-1,step+1))} style={{ ...btnS, fontSize: 10, padding: "4px 8px" }}>▶</button>
        </div>
      )}
    </div>
  );
}
