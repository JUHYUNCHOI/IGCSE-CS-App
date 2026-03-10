import { C, F } from "../constants";
import { useIsMobile } from "../hooks";

export default function Header({ stats, onSearchOpen }) {
  const mobile = useIsMobile();

  const statBadge = (emoji, count, label) => (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 6,
      background: "rgba(255,255,255,0.2)",
      borderRadius: 20,
      padding: "4px 12px",
      backdropFilter: "blur(4px)",
    }}>
      <span>{emoji}</span>
      <span style={{ fontWeight: 800, fontSize: 14 }}>{count}</span>
      <span style={{ fontSize: 11, opacity: 0.9 }}>{label}</span>
    </div>
  );

  return (
    <div style={{
      background: "linear-gradient(135deg, #7C3AED 0%, #3B82F6 100%)",
      color: "#fff",
      padding: mobile ? "16px 16px" : "20px 32px",
      fontFamily: F,
    }}>
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 10,
      }}>
        <div>
          <h1 style={{
            fontSize: mobile ? 20 : 26,
            fontWeight: 800,
            letterSpacing: -0.5,
            margin: 0,
          }}>
            IGCSE CS 0478
          </h1>
          <p style={{
            fontSize: mobile ? 12 : 14,
            opacity: 0.85,
            marginTop: 2,
            margin: "2px 0 0 0",
          }}>
            시험 준비 도우미 &middot; 2026-2028
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {!mobile && (
            <>
              {statBadge("\u{1F4D6}", stats.totalConcepts, "개념")}
              {statBadge("\u{1F4C4}", stats.totalPapers, "기출")}
              {statBadge("\u{1F9E0}", stats.totalQuizzes, "퀴즈")}
            </>
          )}
          {onSearchOpen && (
            <button onClick={onSearchOpen} style={{
              background: "rgba(255,255,255,0.2)",
              border: "none", borderRadius: 20,
              padding: "6px 14px",
              cursor: "pointer", fontFamily: F,
              color: "#fff", fontSize: 14, fontWeight: 600,
              backdropFilter: "blur(4px)",
              display: "flex", alignItems: "center", gap: 4,
            }}>
              <span>🔍</span>
              {!mobile && <span style={{ fontSize: 12 }}>검색</span>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
