import { useState, useRef, useEffect, useMemo } from "react";
import { C, F, cardS, btnS } from "../constants";
import { useIsMobile } from "../hooks";
import syllabusData from "../data/syllabus_topics.json";
import { getAllQuestions } from "../data/quizData";
import { TC } from "./TeachingMode";

// Build search index once
function buildIndex() {
  const items = [];

  // Subtopics
  for (const topic of syllabusData.topics) {
    for (const st of topic.subtopics) {
      const tc = TC[st.id];
      items.push({
        type: "subtopic",
        id: st.id,
        topicId: topic.id,
        paper: topic.paper,
        text: `${st.id} ${st.name} ${tc?.nameKo || ""}`,
        label: st.name,
        labelKo: tc?.nameKo || "",
        subtopicId: st.id,
      });

      // Concepts
      st.key_concepts.forEach((concept, i) => {
        const cData = tc?.concepts[i];
        items.push({
          type: "concept",
          id: `${st.id}_c${i}`,
          paper: topic.paper,
          text: `${concept} ${cData?.ko || ""} ${cData?.teach || ""}`,
          label: concept,
          labelKo: cData?.ko || "",
          subtopicId: st.id,
          subtopicName: st.name,
        });
      });
    }
  }

  // Questions
  for (const q of getAllQuestions()) {
    items.push({
      type: "question",
      id: q.id,
      paper: syllabusData.topics.find(t => t.subtopics.some(st => st.id === q.subtopic))?.paper || 1,
      text: `${q.q} ${q.hint || ""}`,
      label: q.q.length > 80 ? q.q.slice(0, 80) + "..." : q.q,
      subtopicId: q.subtopic,
      questionId: q.id,
    });
  }

  return items;
}

export default function SearchOverlay({ onClose, navigateTo }) {
  const mobile = useIsMobile();
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const index = useMemo(buildIndex, []);

  useEffect(() => {
    inputRef.current?.focus();
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return { subtopics: [], concepts: [], questions: [] };

    const match = (item) => item.text.toLowerCase().includes(q);
    return {
      subtopics: index.filter(i => i.type === "subtopic" && match(i)).slice(0, 5),
      concepts: index.filter(i => i.type === "concept" && match(i)).slice(0, 5),
      questions: index.filter(i => i.type === "question" && match(i)).slice(0, 5),
    };
  }, [query, index]);

  const totalResults = results.subtopics.length + results.concepts.length + results.questions.length;

  const goTo = (view, context) => {
    navigateTo(view, context);
    onClose();
  };

  const COLORS = { 1: C.purple, 2: C.blue };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.5)",
      backdropFilter: "blur(4px)",
      display: "flex", justifyContent: "center",
      paddingTop: mobile ? 20 : 80,
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        width: "100%", maxWidth: 600,
        maxHeight: mobile ? "90vh" : "70vh",
        background: C.white, borderRadius: 16,
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        display: "flex", flexDirection: "column",
        margin: mobile ? "0 12px" : 0,
        overflow: "hidden",
      }}>
        {/* Search input */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "14px 16px",
          borderBottom: `1px solid ${C.border}`,
        }}>
          <span style={{ fontSize: 18, color: C.sub }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="토픽, 개념, 문제 검색..."
            style={{
              flex: 1, border: "none", outline: "none",
              fontSize: 16, fontFamily: F, color: C.text,
              background: "transparent",
            }}
          />
          <button onClick={onClose} style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 18, color: C.sub, padding: "4px 8px",
          }}>✕</button>
        </div>

        {/* Results */}
        <div style={{ overflow: "auto", flex: 1, padding: "8px 0" }}>
          {query.trim().length < 2 && (
            <div style={{ padding: "40px 16px", textAlign: "center", color: C.sub, fontSize: 14 }}>
              검색어를 2글자 이상 입력하세요
            </div>
          )}

          {query.trim().length >= 2 && totalResults === 0 && (
            <div style={{ padding: "40px 16px", textAlign: "center", color: C.sub, fontSize: 14 }}>
              검색 결과가 없습니다
            </div>
          )}

          {/* Subtopics */}
          {results.subtopics.length > 0 && (
            <div style={{ padding: "8px 16px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, marginBottom: 6, textTransform: "uppercase" }}>
                📚 소주제
              </div>
              {results.subtopics.map(item => (
                <button key={item.id} onClick={() => goTo("teaching", { subtopicId: item.subtopicId })}
                  style={{
                    width: "100%", background: "none", border: "none",
                    padding: "8px 12px", borderRadius: 8,
                    cursor: "pointer", fontFamily: F, textAlign: "left",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    transition: "background .1s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F3F4F6"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                >
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>
                      {item.id} {item.label}
                    </span>
                    {item.labelKo && (
                      <span style={{ color: C.sub, fontSize: 13, marginLeft: 6 }}>
                        {item.labelKo}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: 11, color: COLORS[item.paper], fontWeight: 600 }}>
                    수업 보기 →
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Concepts */}
          {results.concepts.length > 0 && (
            <div style={{ padding: "8px 16px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, marginBottom: 6, textTransform: "uppercase" }}>
                💡 개념
              </div>
              {results.concepts.map(item => (
                <button key={item.id} onClick={() => goTo("teaching", { subtopicId: item.subtopicId })}
                  style={{
                    width: "100%", background: "none", border: "none",
                    padding: "8px 12px", borderRadius: 8,
                    cursor: "pointer", fontFamily: F, textAlign: "left",
                    transition: "background .1s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F3F4F6"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                >
                  <div style={{ fontSize: 13, color: C.text, lineHeight: 1.4 }}>
                    {item.label}
                  </div>
                  {item.labelKo && (
                    <div style={{ fontSize: 12, color: COLORS[item.paper], marginTop: 2 }}>
                      {item.labelKo}
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>
                    {item.subtopicId} {item.subtopicName} → 수업 보기
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Questions */}
          {results.questions.length > 0 && (
            <div style={{ padding: "8px 16px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.sub, marginBottom: 6, textTransform: "uppercase" }}>
                📝 문제
              </div>
              {results.questions.map(item => (
                <button key={item.id} onClick={() => goTo("quiz", { subtopicId: item.subtopicId })}
                  style={{
                    width: "100%", background: "none", border: "none",
                    padding: "8px 12px", borderRadius: 8,
                    cursor: "pointer", fontFamily: F, textAlign: "left",
                    transition: "background .1s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F3F4F6"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                >
                  <div style={{ fontSize: 13, color: C.text, lineHeight: 1.4 }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>
                    {item.subtopicId} → 문제 풀기
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
