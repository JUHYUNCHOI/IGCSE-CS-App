import { useState } from "react";
import { C, F, NAV_ITEMS } from "./constants";
import { useIsMobile, useProgress } from "./hooks";
import Header from "./components/Header";
import NavBar from "./components/NavBar";
import TopicBrowser from "./components/TopicBrowser";
import PseudocodeTutor from "./components/PseudocodeTutor";
import TeachingMode from "./components/TeachingMode";
import QuizMode from "./components/QuizMode";
import SearchOverlay from "./components/SearchOverlay";
import PastPaperBrowser from "./components/PastPaperBrowser";

export default function App() {
  const [view, setView] = useState("teaching");
  const [viewContext, setViewContext] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [gradingPair, setGradingPair] = useState(null);
  const mobile = useIsMobile();
  const progressHook = useProgress();

  const navigateTo = (newView, context = null) => {
    setViewContext(context);
    setView(newView);
    setShowSearch(false);
  };

  const openGrading = (qpPath, msPath, label) => {
    setGradingPair({ qpPath, msPath, label });
    setView("grading");
  };

  const renderView = () => {
    switch (view) {
      case "topics":
        return <TopicBrowser {...progressHook} />;
      case "papers":
        return <PastPaperBrowser navigateTo={navigateTo} />;
      case "grading":
        return (
          <div style={{ ...placeholderCard, borderColor: C.green }}>
            <span style={{ fontSize: 40 }}>✅</span>
            <h2 style={{ color: C.text, fontSize: 20, fontWeight: 800 }}>채점 모드</h2>
            <p style={{ color: C.sub, fontSize: 14 }}>곧 추가됩니다</p>
          </div>
        );
      case "quiz":
        return <QuizMode navigateTo={navigateTo} context={viewContext} />;
      case "pseudocode":
        return <PseudocodeTutor />;
      case "teaching":
        return <TeachingMode initialSubtopic={viewContext?.subtopicId} navigateTo={navigateTo} fromView={viewContext?.fromView} />;
      default:
        return null;
    }
  };

  const placeholderCard = {
    background: C.white,
    borderRadius: 16,
    padding: 60,
    border: `2px dashed ${C.border}`,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    minHeight: 300,
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: C.bg,
      fontFamily: F,
      paddingBottom: mobile ? 70 : 0,
    }}>
      <Header stats={progressHook.getOverallStats()} onSearchOpen={() => setShowSearch(true)} />
      {showSearch && (
        <SearchOverlay
          onClose={() => setShowSearch(false)}
          navigateTo={navigateTo}
        />
      )}
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        padding: mobile ? "12px 12px" : "20px 24px",
      }}>
        {!mobile && <NavBar view={view} setView={setView} mobile={false} />}
        {/* 현재 탭 설명 배너 */}
        {(() => {
          const cur = NAV_ITEMS.find(n => n.key === view);
          return cur?.desc ? (
            <div style={{
              fontSize: 12, color: C.sub, marginBottom: 8,
              padding: "4px 0",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ fontSize: 14 }}>{cur.emoji}</span>
              <span><b style={{ color: C.text }}>{cur.label}</b> — {cur.desc}</span>
            </div>
          ) : null;
        })()}
        <div key={view} style={{
          animation: "fadeIn 0.25s ease-out",
        }}>
          {renderView()}
        </div>
      </div>
      {mobile && <NavBar view={view} setView={setView} mobile={true} />}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
