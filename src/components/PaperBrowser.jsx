import { useState, useMemo } from "react";
import PaperViewer from "./PaperViewer";
import { C, F, btnS, cardS, TYPE_LABELS, TYPE_COLORS, SESSION_LABELS } from "../constants";
import { useIsMobile } from "../hooks";
import {
  filterPapers,
  findMatchingMs,
  groupBySession,
  getAvailableYears,
  getPaperLabel,
  getSessionLabel,
} from "../utils/paperUtils";

const sessionFilters = [
  { key: null, label: "All" },
  { key: "m", label: "Mar" },
  { key: "s", label: "May/Jun" },
  { key: "w", label: "Oct/Nov" },
];

const paperFilters = [
  { key: null, label: "All" },
  { key: 1, label: "P1" },
  { key: 2, label: "P2" },
];

const typeFilters = [
  { key: null, label: "All" },
  { key: "qp", label: "QP" },
  { key: "ms", label: "MS" },
];

export default function PaperBrowser({ onOpenGrading, togglePaperCompleted, isPaperCompleted }) {
  const mobile = useIsMobile();
  const availableYears = useMemo(() => getAvailableYears(), []);

  const [yearFilter, setYearFilter] = useState(null);
  const [sessionFilter, setSessionFilter] = useState(null);
  const [paperFilter, setPaperFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [selectedPaper, setSelectedPaper] = useState(null);

  const filteredPapers = useMemo(() => {
    const filters = {};
    if (yearFilter) filters.year = yearFilter;
    if (sessionFilter) filters.session = sessionFilter;
    if (paperFilter) filters.paper = paperFilter;
    if (typeFilter) filters.type = typeFilter;
    return filterPapers(filters);
  }, [yearFilter, sessionFilter, paperFilter, typeFilter]);

  const grouped = useMemo(() => groupBySession(filteredPapers), [filteredPapers]);

  /* ---- small style helpers ---- */
  const filterBtnStyle = (active) => ({
    ...btnS,
    padding: mobile ? "6px 10px" : "6px 14px",
    fontSize: mobile ? 12 : 13,
    background: active ? C.purple : C.white,
    color: active ? "#fff" : C.text,
    border: `1px solid ${active ? C.purple : C.border}`,
  });

  const filterGroupLabel = {
    fontSize: 12,
    fontWeight: 700,
    color: C.sub,
    fontFamily: F,
    marginBottom: 6,
    letterSpacing: 0.5,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* ========== FILTER BAR ========== */}
      <div style={{ ...cardS, padding: mobile ? 14 : 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <h3
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 800,
            color: C.text,
            fontFamily: F,
          }}
        >
          Past Papers
        </h3>

        {/* Year */}
        <div>
          <div style={filterGroupLabel}>Year</div>
          <select
            value={yearFilter || ""}
            onChange={(e) => setYearFilter(e.target.value ? Number(e.target.value) : null)}
            style={{
              ...btnS,
              padding: "7px 12px",
              fontSize: 13,
              background: C.white,
              color: C.text,
              border: `1px solid ${C.border}`,
              borderRadius: 10,
              outline: "none",
              appearance: "auto",
              minWidth: 110,
            }}
          >
            <option value="">All Years</option>
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* Session */}
        <div>
          <div style={filterGroupLabel}>Session</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {sessionFilters.map((s) => (
              <button
                key={s.label}
                onClick={() => setSessionFilter(s.key)}
                style={filterBtnStyle(sessionFilter === s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Paper */}
        <div>
          <div style={filterGroupLabel}>Paper</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {paperFilters.map((p) => (
              <button
                key={p.label}
                onClick={() => setPaperFilter(p.key)}
                style={filterBtnStyle(paperFilter === p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Type */}
        <div>
          <div style={filterGroupLabel}>Type</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {typeFilters.map((t) => (
              <button
                key={t.label}
                onClick={() => setTypeFilter(t.key)}
                style={filterBtnStyle(typeFilter === t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Total count */}
        <div
          style={{
            fontSize: 13,
            color: C.sub,
            fontFamily: F,
            fontWeight: 600,
            paddingTop: 4,
          }}
        >
          {filteredPapers.length}개의 문서
        </div>
      </div>

      {/* ========== RESULTS ========== */}
      {grouped.length === 0 && (
        <div
          style={{
            ...cardS,
            padding: 40,
            textAlign: "center",
            color: C.sub,
            fontSize: 14,
            fontFamily: F,
          }}
        >
          조건에 맞는 문서가 없습니다.
        </div>
      )}

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
              {group.papers.length}개
            </span>
          </div>

          {/* Paper rows */}
          {group.papers.map((paper) => {
            const matchingMs = paper.type === "qp" ? findMatchingMs(paper) : null;
            const completed = isPaperCompleted(paper.filename);
            const typeColor = TYPE_COLORS[paper.type] || C.sub;
            const typeLabel = TYPE_LABELS[paper.type] || paper.type;

            return (
              <div
                key={paper.filename}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: mobile ? 8 : 12,
                  padding: mobile ? "10px 14px" : "12px 20px",
                  borderBottom: `1px solid ${C.border}`,
                  flexWrap: "wrap",
                }}
              >
                {/* Completed checkbox */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    flexShrink: 0,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={completed}
                    onChange={() => togglePaperCompleted(paper.filename)}
                    style={{
                      width: 18,
                      height: 18,
                      accentColor: C.purple,
                      cursor: "pointer",
                    }}
                  />
                </label>

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
                  {getPaperLabel(paper)}
                </span>

                {/* Type badge */}
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: typeColor,
                    background: `${typeColor}18`,
                    padding: "3px 10px",
                    borderRadius: 20,
                    fontFamily: F,
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  {typeLabel}
                </span>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() =>
                      setSelectedPaper({
                        path: paper.path,
                        title: `${getSessionLabel(paper)} - ${getPaperLabel(paper)} (${typeLabel})`,
                      })
                    }
                    style={{
                      ...btnS,
                      padding: "5px 12px",
                      fontSize: 12,
                      background: C.purple,
                      color: "#fff",
                    }}
                  >
                    {mobile ? "열기" : "열기"}
                  </button>

                  {matchingMs && (
                    <button
                      onClick={() =>
                        onOpenGrading(paper.path, matchingMs.path, `${getSessionLabel(paper)} ${getPaperLabel(paper)}`)
                      }
                      style={{
                        ...btnS,
                        padding: "5px 12px",
                        fontSize: 12,
                        background: C.green,
                        color: "#fff",
                      }}
                    >
                      {mobile ? "채점" : "채점 모드"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {/* ========== PAPER VIEWER MODAL ========== */}
      {selectedPaper && (
        <PaperViewer
          paperPath={selectedPaper.path}
          title={selectedPaper.title}
          onClose={() => setSelectedPaper(null)}
        />
      )}
    </div>
  );
}
