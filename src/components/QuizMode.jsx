import { useState, useEffect, useRef } from "react";
import { C, F, cardS, btnS } from "../constants";
import { useIsMobile } from "../hooks";
import syllabusData from "../data/syllabus_topics.json";
import { getQuestionsBySubtopic } from "../data/quizData";
import QuizQuestion from "./QuizQuestion";
import { TC } from "./TeachingMode";
import { getPastQuestionsBySubtopic } from "../data/pastPaperData";

// ─── PROGRESS STORAGE ───
const STORAGE_KEY = "igcse-quiz-progress";

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
  catch { return {}; }
}

function saveProgress(p) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

// ─── PAST PAPER HINT ───
function PastPaperHint({ subtopicId }) {
  const [open, setOpen] = useState(false);
  const pastQs = getPastQuestionsBySubtopic(subtopicId).slice(0, 5);
  if (pastQs.length === 0) return null;

  return (
    <div style={{ marginTop: 8 }}>
      <button onClick={() => setOpen(!open)} style={{
        ...btnS, fontSize: 12,
        background: C.blueLight, color: C.blue,
      }}>
        📄 비슷한 기출문제 ({pastQs.length > 5 ? "5+" : pastQs.length}개) {open ? "▲" : "▼"}
      </button>
      {open && (
        <div style={{
          marginTop: 6, padding: 10, background: "#F8FAFC",
          borderRadius: 10, border: `1px solid ${C.border}`,
        }}>
          {pastQs.map((pq, idx) => (
            <div key={idx} style={{
              padding: "6px 0",
              borderTop: idx > 0 ? `1px solid ${C.border}` : "none",
              fontSize: 13,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 700, color: C.blue, fontSize: 12 }}>
                  {pq.paper} Q{pq.qNum}
                </span>
                <span style={{ fontSize: 11, color: C.sub }}>{pq.marks}점</span>
              </div>
              <div style={{ color: C.text, marginTop: 2, lineHeight: 1.4 }}>
                {pq.text.length > 120 ? pq.text.slice(0, 120) + "..." : pq.text}
              </div>
            </div>
          ))}
          <div style={{ fontSize: 11, color: C.sub, marginTop: 6, textAlign: "center" }}>
            기출문제 탭에서 전체 시험지를 볼 수 있습니다
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───
export default function QuizMode({ navigateTo, context }) {
  const mobile = useIsMobile();
  const [progress, setProgress] = useState(loadProgress);
  const [statusFilter, setStatusFilter] = useState("all");
  const [paperFilter, setPaperFilter] = useState("all");
  const [openSections, setOpenSections] = useState(new Set());
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(new Set());
  const sectionRefs = useRef({});

  // Restore submitted state from progress
  useEffect(() => {
    const prog = loadProgress();
    setSubmitted(new Set(Object.keys(prog)));
    const restoredAnswers = {};
    for (const [qId, data] of Object.entries(prog)) {
      restoredAnswers[qId] = data.answer;
    }
    setAnswers(prev => ({ ...restoredAnswers, ...prev }));
  }, []);

  // Jump to subtopic from context
  useEffect(() => {
    if (context?.subtopicId) {
      setOpenSections(new Set([context.subtopicId]));
      setTimeout(() => {
        sectionRefs.current[context.subtopicId]?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [context?.subtopicId]);

  const handleAnswer = (qId, answer) => {
    setAnswers(prev => ({ ...prev, [qId]: answer }));
  };

  const handleSubmit = (question) => {
    const qId = question.id;
    const userAns = answers[qId];
    if (userAns === undefined) return;

    let correct = false;
    if (question.type === "mc") {
      if (Array.isArray(question.answer)) {
        correct = Array.isArray(userAns) &&
          userAns.length === question.answer.length &&
          [...userAns].sort().every((v, i) => v === [...question.answer].sort()[i]);
      } else {
        correct = userAns === question.answer;
      }
    } else {
      const norm = String(userAns).trim().toLowerCase();
      const ans = String(question.answer).trim().toLowerCase();
      correct = norm === ans || (question.accept || []).some(a => String(a).trim().toLowerCase() === norm);
    }

    const newProgress = { ...progress, [qId]: { answer: userAns, correct, timestamp: Date.now() } };
    setProgress(newProgress);
    saveProgress(newProgress);
    setSubmitted(prev => new Set([...prev, qId]));
  };

  const toggleSection = (stId) => {
    setOpenSections(prev => {
      const next = new Set(prev);
      next.has(stId) ? next.delete(stId) : next.add(stId);
      return next;
    });
  };

  const resetProgress = () => {
    if (!confirm("모든 진도를 초기화하시겠습니까?")) return;
    setProgress({});
    saveProgress({});
    setAnswers({});
    setSubmitted(new Set());
  };

  // Build filtered data
  const topics = syllabusData.topics.filter(t =>
    paperFilter === "all" || t.paper === Number(paperFilter)
  );

  const getFilteredQuestions = (questions) => {
    if (statusFilter === "all") return questions;
    if (statusFilter === "wrong") return questions.filter(q => progress[q.id]?.correct === false);
    if (statusFilter === "unanswered") return questions.filter(q => !progress[q.id]);
    return questions;
  };

  // Stats
  const allQuestions = syllabusData.topics.flatMap(t =>
    t.subtopics.flatMap(st => getQuestionsBySubtopic(st.id))
  );
  const totalAnswered = allQuestions.filter(q => progress[q.id]).length;
  const totalCorrect = allQuestions.filter(q => progress[q.id]?.correct).length;
  const totalWrong = allQuestions.filter(q => progress[q.id]?.correct === false).length;

  // Check if any visible questions exist
  const hasVisibleTopics = topics.some(t =>
    t.subtopics.some(st => getFilteredQuestions(getQuestionsBySubtopic(st.id)).length > 0)
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <h2 style={{ color: C.text, fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>
            연습 모드
          </h2>
          <p style={{ color: C.sub, fontSize: 13, margin: 0 }}>
            {totalAnswered}/{allQuestions.length} 완료
            {totalCorrect > 0 && <> · <span style={{ color: C.green }}>{totalCorrect} 정답</span></>}
            {totalWrong > 0 && <> · <span style={{ color: C.red }}>{totalWrong} 오답</span></>}
          </p>
        </div>
        {totalAnswered > 0 && (
          <button onClick={resetProgress} style={{
            ...btnS, background: C.redLight, color: "#991B1B", fontSize: 12,
          }}>
            초기화
          </button>
        )}
      </div>

      {/* Progress bar */}
      {totalAnswered > 0 && (
        <div style={{
          height: 6, background: C.border, borderRadius: 3, marginBottom: 12, overflow: "hidden",
          display: "flex",
        }}>
          <div style={{ width: `${(totalCorrect / allQuestions.length) * 100}%`, background: C.green, transition: "width .3s" }} />
          <div style={{ width: `${(totalWrong / allQuestions.length) * 100}%`, background: C.red, transition: "width .3s" }} />
        </div>
      )}

      {/* Status filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
        {[
          { key: "all", label: "전체" },
          { key: "wrong", label: `틀린 문제 (${totalWrong})` },
          { key: "unanswered", label: `안 푼 문제 (${allQuestions.length - totalAnswered})` },
        ].map(f => (
          <button key={f.key} onClick={() => setStatusFilter(f.key)} style={{
            ...btnS, fontSize: 12,
            background: statusFilter === f.key ? C.purple : C.purpleLight,
            color: statusFilter === f.key ? "#fff" : C.purple,
          }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Paper filters */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {[
          { key: "all", label: "전체" },
          { key: "1", label: "Paper 1" },
          { key: "2", label: "Paper 2" },
        ].map(f => (
          <button key={f.key} onClick={() => setPaperFilter(f.key)} style={{
            ...btnS, fontSize: 12,
            background: paperFilter === f.key ? C.blue : C.blueLight,
            color: paperFilter === f.key ? "#fff" : C.blue,
          }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Topics & Subtopics */}
      {topics.map(topic => {
        const color = topic.paper === 1 ? C.purple : C.blue;
        const hasVisible = topic.subtopics.some(st =>
          getFilteredQuestions(getQuestionsBySubtopic(st.id)).length > 0
        );
        if (!hasVisible) return null;

        return (
          <div key={topic.id} style={{ marginBottom: 16 }}>
            <div style={{
              fontWeight: 800, fontSize: 15, color,
              padding: "8px 0", borderBottom: `2px solid ${color}`,
              marginBottom: 8,
            }}>
              Topic {topic.id}: {topic.name}
            </div>

            {topic.subtopics.map(st => {
              const allQs = getQuestionsBySubtopic(st.id);
              const filteredQs = getFilteredQuestions(allQs);
              if (filteredQs.length === 0) return null;

              const answered = allQs.filter(q => progress[q.id]).length;
              const correct = allQs.filter(q => progress[q.id]?.correct).length;
              const wrong = allQs.filter(q => progress[q.id]?.correct === false).length;
              const tc = TC[st.id];
              const isOpen = openSections.has(st.id);

              return (
                <div key={st.id} ref={el => sectionRefs.current[st.id] = el}
                  style={{ ...cardS, marginBottom: 8, padding: 0, overflow: "hidden" }}>
                  {/* Section header */}
                  <button onClick={() => toggleSection(st.id)} style={{
                    width: "100%", background: "none", border: "none",
                    padding: mobile ? "12px 12px" : "12px 16px",
                    cursor: "pointer", fontFamily: F,
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    borderLeft: `4px solid ${color}`,
                  }}>
                    <div style={{ textAlign: "left" }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: C.text }}>
                        {st.id} {st.name}
                        {tc && <span style={{ color: C.sub, fontWeight: 500 }}> · {tc.nameKo}</span>}
                      </div>
                      <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>
                        {filteredQs.length}문제
                        {answered > 0 && <> · {answered}/{allQs.length} 완료</>}
                        {correct > 0 && <> · <span style={{ color: C.green }}>{correct}✓</span></>}
                        {wrong > 0 && <> · <span style={{ color: C.red }}>{wrong}✗</span></>}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span onClick={(e) => {
                        e.stopPropagation();
                        navigateTo("teaching", { subtopicId: st.id });
                      }} style={{
                        ...btnS, fontSize: 11, padding: "4px 10px",
                        background: color + "15", color: color,
                        border: `1px solid ${color}40`,
                      }}>
                        📖 수업
                      </span>
                      <span style={{
                        fontSize: 14, color: C.sub,
                        transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                        transition: "transform .2s", display: "inline-block",
                      }}>▼</span>
                    </div>
                  </button>

                  {/* Questions */}
                  {isOpen && (
                    <div style={{ padding: mobile ? "0 12px 12px" : "0 16px 16px" }}>
                      {filteredQs.map((q, i) => {
                        const isSubmitted = submitted.has(q.id);
                        const userAns = answers[q.id];
                        return (
                          <div key={q.id} style={{
                            padding: "12px 0",
                            borderTop: i > 0 ? `1px solid ${C.border}` : "none",
                          }}>
                            <QuizQuestion
                              question={q}
                              index={i}
                              userAnswer={userAns}
                              onAnswer={(ans) => handleAnswer(q.id, ans)}
                              submitted={isSubmitted}
                            />
                            {!isSubmitted && answers[q.id] !== undefined && (
                              <button onClick={() => handleSubmit(q)} style={{
                                ...btnS, marginTop: 8,
                                background: C.purple, color: "#fff",
                              }}>
                                제출
                              </button>
                            )}
                            {isSubmitted && progress[q.id]?.correct === false && (
                              <div>
                                <button onClick={() => navigateTo("teaching", { subtopicId: q.subtopic })} style={{
                                  ...btnS, marginTop: 8,
                                  background: C.orangeLight, color: "#92400E",
                                  fontSize: 12,
                                }}>
                                  이 내용 공부하기 →
                                </button>
                                <PastPaperHint subtopicId={q.subtopic} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Empty state */}
      {!hasVisibleTopics && (
        <div style={{ ...cardS, textAlign: "center", padding: 40, color: C.sub }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>
            {statusFilter === "wrong" ? "🎉" : "✨"}
          </div>
          <div style={{ fontWeight: 700, fontSize: 16, color: C.text }}>
            {statusFilter === "wrong" ? "틀린 문제가 없습니다!" : "모든 문제를 풀었습니다!"}
          </div>
          {statusFilter !== "all" && (
            <button onClick={() => setStatusFilter("all")} style={{
              ...btnS, marginTop: 12, background: C.purpleLight, color: C.purple,
            }}>
              전체 문제 보기
            </button>
          )}
        </div>
      )}
    </div>
  );
}
