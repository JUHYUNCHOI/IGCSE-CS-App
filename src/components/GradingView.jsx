import { useState, useMemo } from "react";
import { C, F, btnS, cardS, SESSION_LABELS } from "../constants";
import { useIsMobile } from "../hooks";
import { getQpMsPairs, groupBySession, getPaperLabel, getSessionLabel } from "../utils/paperUtils";

export default function GradingView({ pair, onSelectPair, togglePaperCompleted, isPaperCompleted }) {
  const mobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("qp"); // mobile tab: "qp" | "ms"

  /* ---- Pair selection screen ---- */
  if (!pair) {
    return <PairSelector onSelectPair={onSelectPair} isPaperCompleted={isPaperCompleted} mobile={mobile} />;
  }

  /* ---- Grading mode: side-by-side or tabbed ---- */
  const completed = isPaperCompleted(pair.qpPath);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: mobile ? "calc(100vh - 140px)" : "calc(100vh - 180px)",
        background: C.white,
        borderRadius: 16,
        overflow: "hidden",
        border: `1px solid ${C.border}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      {/* ========== TOP BAR ========== */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: mobile ? "10px 12px" : "12px 20px",
          borderBottom: `1px solid ${C.border}`,
          background: C.bg,
          flexShrink: 0,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            fontSize: mobile ? 14 : 15,
            fontWeight: 800,
            color: C.text,
            fontFamily: F,
            flex: 1,
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {pair.label}
        </span>

        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          <button
            onClick={() => togglePaperCompleted(pair.qpPath)}
            style={{
              ...btnS,
              padding: "6px 12px",
              fontSize: 12,
              background: completed ? C.green : C.white,
              color: completed ? "#fff" : C.text,
              border: `1px solid ${completed ? C.green : C.border}`,
            }}
          >
            {completed ? "완료됨" : "완료 체크"}
          </button>
          <button
            onClick={() => onSelectPair(null)}
            style={{
              ...btnS,
              padding: "6px 12px",
              fontSize: 12,
              background: C.white,
              color: C.text,
              border: `1px solid ${C.border}`,
            }}
          >
            {mobile ? "목록" : "다른 문제 선택"}
          </button>
        </div>
      </div>

      {/* ========== MOBILE TABS ========== */}
      {mobile && (
        <div
          style={{
            display: "flex",
            borderBottom: `1px solid ${C.border}`,
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setActiveTab("qp")}
            style={{
              flex: 1,
              padding: "10px 0",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: F,
              cursor: "pointer",
              border: "none",
              borderBottom: activeTab === "qp" ? `3px solid ${C.purple}` : "3px solid transparent",
              background: activeTab === "qp" ? C.white : C.bg,
              color: activeTab === "qp" ? C.purple : C.sub,
              transition: "all .15s",
            }}
          >
            시험지
          </button>
          <button
            onClick={() => setActiveTab("ms")}
            style={{
              flex: 1,
              padding: "10px 0",
              fontSize: 14,
              fontWeight: 700,
              fontFamily: F,
              cursor: "pointer",
              border: "none",
              borderBottom: activeTab === "ms" ? `3px solid ${C.green}` : "3px solid transparent",
              background: activeTab === "ms" ? C.white : C.bg,
              color: activeTab === "ms" ? C.green : C.sub,
              transition: "all .15s",
            }}
          >
            채점기준
          </button>
        </div>
      )}

      {/* ========== CONTENT AREA ========== */}
      {mobile ? (
        /* Mobile: show one iframe at a time */
        <iframe
          key={activeTab}
          src={activeTab === "qp" ? pair.qpPath : pair.msPath}
          title={activeTab === "qp" ? "Question Paper" : "Mark Scheme"}
          style={{
            flex: 1,
            width: "100%",
            border: "none",
            background: "#f0f0f0",
          }}
        />
      ) : (
        /* Desktop: side-by-side with purple divider */
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "1fr 4px 1fr",
            minHeight: 0,
          }}
        >
          {/* QP pane */}
          <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div
              style={{
                padding: "8px 16px",
                fontSize: 12,
                fontWeight: 700,
                color: C.blue,
                fontFamily: F,
                background: `${C.blue}0C`,
                borderBottom: `1px solid ${C.border}`,
                flexShrink: 0,
              }}
            >
              시험지 (Question Paper)
            </div>
            <iframe
              src={pair.qpPath}
              title="Question Paper"
              style={{
                flex: 1,
                width: "100%",
                border: "none",
                background: "#f0f0f0",
              }}
            />
          </div>

          {/* Divider */}
          <div
            style={{
              background: C.purple,
              borderRadius: 2,
            }}
          />

          {/* MS pane */}
          <div style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
            <div
              style={{
                padding: "8px 16px",
                fontSize: 12,
                fontWeight: 700,
                color: C.green,
                fontFamily: F,
                background: `${C.green}0C`,
                borderBottom: `1px solid ${C.border}`,
                flexShrink: 0,
              }}
            >
              채점기준 (Mark Scheme)
            </div>
            <iframe
              src={pair.msPath}
              title="Mark Scheme"
              style={{
                flex: 1,
                width: "100%",
                border: "none",
                background: "#f0f0f0",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ==================================================
   PairSelector - shown when no pair is selected
   ================================================== */
function PairSelector({ onSelectPair, isPaperCompleted, mobile }) {
  const allPairs = useMemo(() => getQpMsPairs(), []);

  /* Group pairs by session using the QP entry for grouping */
  const grouped = useMemo(() => {
    const pairsAsPapers = allPairs.map((p) => ({
      ...p.qp,
      _pair: p,
    }));
    const groups = {};
    for (const p of pairsAsPapers) {
      const key = `${p.year} ${p.sessionName}`;
      if (!groups[key])
        groups[key] = { label: key, year: p.year, sessionCode: p.sessionCode, items: [] };
      groups[key].items.push(p);
    }
    return Object.values(groups).sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      const so = { w: 0, s: 1, m: 2 };
      return (so[a.sessionCode] || 3) - (so[b.sessionCode] || 3);
    });
  }, [allPairs]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Header card */}
      <div style={{ ...cardS, padding: mobile ? 14 : 20 }}>
        <h3
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 800,
            color: C.text,
            fontFamily: F,
            marginBottom: 6,
          }}
        >
          채점 모드
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: C.sub,
            fontFamily: F,
            lineHeight: 1.5,
          }}
        >
          시험지와 채점기준을 나란히 보면서 자기 채점을 할 수 있습니다.
          <br />
          아래에서 시작할 시험을 선택하세요.
        </p>
        <div
          style={{
            fontSize: 13,
            color: C.sub,
            fontFamily: F,
            fontWeight: 600,
            marginTop: 8,
          }}
        >
          총 {allPairs.length}개의 세트
        </div>
      </div>

      {/* Grouped list */}
      {grouped.map((group) => (
        <div key={group.label} style={{ ...cardS, padding: 0, overflow: "hidden" }}>
          {/* Group header */}
          <div
            style={{
              padding: mobile ? "12px 14px" : "14px 20px",
              background: C.bg,
              borderBottom: `1px solid ${C.border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: C.text,
                fontFamily: F,
              }}
            >
              {group.label}
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: C.sub,
                fontFamily: F,
              }}
            >
              {group.items.length}개
            </span>
          </div>

          {/* Pair rows */}
          {group.items.map((item) => {
            const pair = item._pair;
            const label = `${getSessionLabel(item)} ${getPaperLabel(item)}`;
            const completed = isPaperCompleted(pair.qp.path);

            return (
              <div
                key={pair.qp.filename}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: mobile ? 8 : 12,
                  padding: mobile ? "10px 14px" : "12px 20px",
                  borderBottom: `1px solid ${C.border}`,
                }}
              >
                {/* Completed indicator */}
                {completed && (
                  <span
                    style={{
                      fontSize: 14,
                      flexShrink: 0,
                    }}
                  >
                    &#10003;
                  </span>
                )}

                {/* Paper label */}
                <span
                  style={{
                    flex: 1,
                    fontSize: 14,
                    fontWeight: 700,
                    color: completed ? C.sub : C.text,
                    fontFamily: F,
                    textDecoration: completed ? "line-through" : "none",
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {getPaperLabel(item)}
                </span>

                {/* QP + MS badges */}
                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: C.blue,
                      background: `${C.blue}18`,
                      padding: "2px 8px",
                      borderRadius: 20,
                      fontFamily: F,
                    }}
                  >
                    QP
                  </span>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: C.green,
                      background: `${C.green}18`,
                      padding: "2px 8px",
                      borderRadius: 20,
                      fontFamily: F,
                    }}
                  >
                    MS
                  </span>
                </div>

                {/* Start button */}
                <button
                  onClick={() =>
                    onSelectPair({
                      qpPath: pair.qp.path,
                      msPath: pair.ms.path,
                      label,
                    })
                  }
                  style={{
                    ...btnS,
                    padding: "5px 14px",
                    fontSize: 12,
                    background: C.purple,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  시작
                </button>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
