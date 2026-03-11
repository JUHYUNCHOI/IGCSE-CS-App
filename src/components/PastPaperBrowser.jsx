import { useState, useMemo } from "react";
import { C, F, cardS, btnS } from "../constants";
import { useIsMobile } from "../hooks";
import { pastPapers, getPastQuestionsBySubtopic, getPastQuestionCountBySubtopic } from "../data/pastPaperData";
import syllabusData from "../data/syllabus_topics.json";
import { TC } from "./TeachingMode";

// ── Text cleanup (PDF parsing artifacts) ──
function cleanQText(s) {
  if (!s) return "";
  let t = s;
  // 1) 선행 "숫자 콤마" 제거: "1 ," → "", "2 , Some text" → "Some text"
  t = t.replace(/^\d+[\s,]*,\s*/g, "");
  // 2) UCLES 워터마크 제거: "UCLES 2021 0478/12/F/M/21"
  t = t.replace(/\s*UCLES\s+\d{4}\s+0478\/\d{2,3}\/[A-Z]\/[A-Z]\/\d{2}\s*/g, " ");
  // 3) [Turn over 제거
  t = t.replace(/\s*\[Turn over\s*/g, "");
  // 4) 다음 문제 번호 이후 잘라내기: "... answer. 10 A number game..."
  t = t.replace(/([.?!])\s+\d{1,2}\s+[A-Z][a-z].*$/, "$1");
  // 5) "DFD" placeholder 제거
  t = t.replace(/\s*DFD\s*/g, " ");
  // 6) 빈 bullet 정리: "• • •" → "•"
  t = t.replace(/[•]\s*(?=[•])/g, "");
  // 7) 연속 공백 정리
  t = t.replace(/\s{2,}/g, " ");
  return t.trim();
}

// 깨진 문제 필터 (파싱 실패한 것들 숨기기)
function isValidQuestion(q) {
  const t = cleanQText(q.text);
  return t.length >= 20 && q.marks > 0 && q.marks <= 30;
}

// 문제 텍스트를 구조화된 JSX로 변환
function RenderQText({ text }) {
  const t = cleanQText(text);
  if (!t) return null;

  // ── 보기 목록이 있는 "Complete... from the list" 패턴 감지 ──
  // 보기 아이템: 1~10자 단어가 4개 이상 연속 (단, 2단어 이상 문장이 시작되면 중단)
  const listMatch = t.match(
    /^(.*?(?:from the list|from the box|item once|once\.)\.?\s*)((?:(?:[A-Z0-9][\w-]*|[a-z][\w-]*)\s+)*?(?:[A-Z0-9][\w-]*|[a-z][\w-]*))(\s+(?:The|A |An |Each |It |This |In |When |Give |State |Describe |Explain |Identify ).*)/s
  );
  if (listMatch) {
    const instruction = listMatch[1].trim();
    const items = listMatch[2].trim().split(/\s+/);
    const body = listMatch[3].trim()
      .replace(/\s*(_{3,})/g, "\n$1")
      .replace(/(_{3,}\s*[.,])\s+/g, "$1\n");
    return (
      <>
        <div style={{ marginBottom: 10 }}>{instruction}</div>
        <div style={{
          display: "flex", flexWrap: "wrap", gap: "6px 8px",
          padding: "8px 12px", borderRadius: 8,
          background: "#F0F4FF", border: "1px solid #D0D8F0",
          marginBottom: 10,
        }}>
          {items.map((item, i) => (
            <span key={i} style={{
              padding: "2px 8px", borderRadius: 6, fontSize: 13, fontWeight: 600,
              background: "#fff", border: "1px solid #C8D0E8", color: "#374151",
            }}>{item}</span>
          ))}
        </div>
        <div style={{ whiteSpace: "pre-line" }}>{body}</div>
      </>
    );
  }

  // ── "Draw a line" 매칭 문제 ──
  const drawMatch = t.match(/^(.*?Draw a line.*?\.)\s+(.*)/s);
  if (drawMatch) {
    const instruction = drawMatch[1].trim();
    const pairs = drawMatch[2].trim();
    return (
      <>
        <div style={{ marginBottom: 10 }}>{instruction}</div>
        <div style={{
          padding: "8px 12px", borderRadius: 8,
          background: "#F9FAFB", border: "1px solid #E5E7EB",
          whiteSpace: "pre-line", fontSize: 13, lineHeight: 1.7,
        }}>{pairs}</div>
      </>
    );
  }

  // ── 일반 문제 ── 빈칸/이진수 줄바꿈
  const formatted = t
    .replace(/\s*(_{3,})/g, "\n$1")
    .replace(/\s+(\d{4,}\s*\+?\s*\d{4,})/g, "\n$1")
    .replace(/(_{3,}\s*[.,])\s+/g, "$1\n")
    .trim();
  return <span style={{ whiteSpace: "pre-line" }}>{formatted}</span>;
}

// ── Progress storage ──
const PP_STORAGE = "igcse-pp-progress";
function loadPPProgress() {
  try { return JSON.parse(localStorage.getItem(PP_STORAGE) || "{}"); }
  catch { return {}; }
}
function savePPProgress(p) { localStorage.setItem(PP_STORAGE, JSON.stringify(p)); }

// ── Exam Info Panel ──
function ExamInfoPanel() {
  const [open, setOpen] = useState(false);
  const hd = { fontWeight: 700, fontSize: 13, color: C.blue, marginBottom: 4, marginTop: 12 };
  const row = { display: "flex", gap: 8, marginBottom: 2 };
  const label = { fontWeight: 600, minWidth: 80, fontSize: 12, color: C.text };
  const val = { fontSize: 12, color: C.sub };
  const pill = (bg, fg) => ({
    display: "inline-block", padding: "2px 8px", borderRadius: 10,
    fontSize: 11, fontWeight: 600, background: bg, color: fg, marginRight: 4,
  });

  return (
    <div style={{
      ...cardS, marginBottom: 12, padding: 0, overflow: "hidden",
      border: `1px solid ${C.blue}30`,
    }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", background: "none", border: "none",
        padding: "10px 14px", cursor: "pointer", fontFamily: F,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: C.text }}>
          📋 IGCSE CS 0478 시험 안내
        </span>
        <span style={{
          fontSize: 14, color: C.sub,
          transform: open ? "rotate(180deg)" : "rotate(0)",
          transition: "transform .2s", display: "inline-block",
        }}>▼</span>
      </button>

      {open && (
        <div style={{ padding: "0 14px 14px", lineHeight: 1.7 }}>
          {/* Papers */}
          <div style={hd}>시험 구성</div>
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8,
          }}>
            <div style={{
              padding: "8px 10px", borderRadius: 8,
              background: C.purpleLight, border: `1px solid ${C.purple}30`,
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: C.purple }}>Paper 1</div>
              <div style={{ fontSize: 11, color: C.sub }}>Computer Systems</div>
              <div style={{ fontSize: 12, color: C.text, marginTop: 4 }}>
                <b>1시간 45분</b> · 75점
              </div>
              <div style={{ fontSize: 11, color: C.sub }}>
                단답형 + 서술형 (이론)
              </div>
            </div>
            <div style={{
              padding: "8px 10px", borderRadius: 8,
              background: C.blueLight, border: `1px solid ${C.blue}30`,
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: C.blue }}>Paper 2</div>
              <div style={{ fontSize: 11, color: C.sub }}>Algorithms & Programming</div>
              <div style={{ fontSize: 12, color: C.text, marginTop: 4 }}>
                <b>1시간 45분</b> · 50점
              </div>
              <div style={{ fontSize: 11, color: C.sub }}>
                수도코드 작성 · 알고리즘 추적
              </div>
            </div>
          </div>

          {/* Sessions */}
          <div style={hd}>시험 시기 (연 3회)</div>
          <div style={{ fontSize: 12, marginBottom: 6 }}>
            <div style={row}>
              <span style={pill(C.greenLight, "#065F46")}>Mar</span>
              <span style={val}>2~3월 · 인도, 일부 아시아 학교</span>
            </div>
            <div style={row}>
              <span style={pill(C.blueLight, C.blue)}>May/Jun</span>
              <span style={val}>5~6월 · <b>전 세계 대부분</b> (주요 세션)</span>
            </div>
            <div style={row}>
              <span style={pill(C.orangeLight, "#92400E")}>Oct/Nov</span>
              <span style={val}>10~11월 · 남반구, 일부 아시아</span>
            </div>
          </div>

          {/* Regional info */}
          <div style={hd}>지역별 시험 시기</div>
          <div style={{ fontSize: 12 }}>
            <div style={row}>
              <span style={label}>🇰🇷 한국</span>
              <span style={val}>
                <span style={pill(C.blueLight, C.blue)}>May/Jun</span>
                제주 영국제 등
              </span>
            </div>
            <div style={row}>
              <span style={label}>🇲🇾 말레이시아</span>
              <span style={val}>
                <span style={pill(C.blueLight, C.blue)}>May/Jun</span>
                <span style={pill(C.orangeLight, "#92400E")}>Oct/Nov</span>
              </span>
            </div>
            <div style={row}>
              <span style={label}>🇸🇬 싱가포르</span>
              <span style={val}>
                <span style={pill(C.blueLight, C.blue)}>May/Jun</span>
                <span style={pill(C.orangeLight, "#92400E")}>Oct/Nov</span>
              </span>
            </div>
            <div style={row}>
              <span style={label}>🇬🇧 영국</span>
              <span style={val}>
                <span style={pill(C.blueLight, C.blue)}>May/Jun</span>
                주로 6월
              </span>
            </div>
          </div>

          {/* Pseudocode */}
          <div style={hd}>수도코드 (Pseudocode) 시험</div>
          <div style={{ fontSize: 12, color: C.text }}>
            <div>• <b>Paper 2</b>에서 출제 — 종이에 <b>손으로 직접 작성</b> (컴퓨터 X)</div>
            <div>• Cambridge 자체 수도코드 문법 사용 (Python과 유사하지만 다름)</div>
            <div>• 주어진 코드 읽고 <b>변수 추적(trace table)</b> 작성</div>
            <div>• 코드의 <b>오류 찾기/수정</b></div>
            <div>• 문제 설명 보고 <b>수도코드 직접 작성</b></div>
          </div>

          {/* Tips */}
          <div style={hd}>시험 팁</div>
          <div style={{ fontSize: 12, color: C.text }}>
            <div>• Paper 1 + Paper 2 합산 = 최종 성적 (A*~G)</div>
            <div>• 한 세션에 Paper 1, 2 모두 응시 (보통 며칠 간격)</div>
            <div>• 각 Paper는 variant(버전)가 3개 — 학교가 배정받음</div>
            <div>• 계산기 사용 불가</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PastPaperBrowser({ navigateTo }) {
  const mobile = useIsMobile();
  const [view, setView] = useState("byTopic");
  const [paperFilter, setPaperFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [expandedTopic, setExpandedTopic] = useState(null);
  const [expandedPaper, setExpandedPaper] = useState(null);

  const counts = useMemo(getPastQuestionCountBySubtopic, []);
  const years = [...new Set(pastPapers.map(p => p.year))].sort((a, b) => b - a);

  const filteredPapers = useMemo(() => {
    return pastPapers.filter(p => {
      if (paperFilter !== "all" && p.paper !== Number(paperFilter)) return false;
      if (yearFilter !== "all" && p.year !== Number(yearFilter)) return false;
      return true;
    }).sort((a, b) => b.year - a.year || a.session.localeCompare(b.session));
  }, [paperFilter, yearFilter]);

  return (
    <div>
      <h2 style={{ color: C.text, fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>
        기출문제 풀기
      </h2>
      <p style={{ color: C.sub, fontSize: 13, margin: "0 0 12px" }}>
        {pastPapers.length}개 시험지 · {pastPapers.reduce((s, p) => s + p.questions.length, 0)}개 문제
      </p>

      <ExamInfoPanel />

      {/* View toggle */}
      <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
        {[
          { key: "byTopic", label: "소주제별" },
          { key: "byPaper", label: "시험지별" },
        ].map(v => (
          <button key={v.key} onClick={() => setView(v.key)} style={{
            ...btnS, fontSize: 12,
            background: view === v.key ? C.blue : C.blueLight,
            color: view === v.key ? "#fff" : C.blue,
          }}>
            {v.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
        {[
          { key: "all", label: "전체" },
          { key: "1", label: "Paper 1" },
          { key: "2", label: "Paper 2" },
        ].map(f => (
          <button key={f.key} onClick={() => setPaperFilter(f.key)} style={{
            ...btnS, fontSize: 12,
            background: paperFilter === f.key ? C.purple : C.purpleLight,
            color: paperFilter === f.key ? "#fff" : C.purple,
          }}>
            {f.label}
          </button>
        ))}
        {view === "byPaper" && (
          <select
            value={yearFilter}
            onChange={e => setYearFilter(e.target.value)}
            style={{
              padding: "6px 10px", borderRadius: 10, border: `1px solid ${C.border}`,
              fontSize: 12, fontFamily: F, color: C.text, background: C.white,
            }}
          >
            <option value="all">전체 연도</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        )}
      </div>

      {view === "byTopic" ? (
        <TopicView
          paperFilter={paperFilter}
          counts={counts}
          expandedTopic={expandedTopic}
          setExpandedTopic={setExpandedTopic}
          navigateTo={navigateTo}
          mobile={mobile}
        />
      ) : (
        <PaperListView
          papers={filteredPapers}
          expandedPaper={expandedPaper}
          setExpandedPaper={setExpandedPaper}
          mobile={mobile}
        />
      )}
    </div>
  );
}

// ── Topic View ──
function TopicView({ paperFilter, counts, expandedTopic, setExpandedTopic, navigateTo, mobile }) {
  const topics = syllabusData.topics.filter(t =>
    paperFilter === "all" || t.paper === Number(paperFilter)
  );

  return (
    <div>
      {topics.map(topic => {
        const color = topic.paper === 1 ? C.purple : C.blue;
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
              const count = counts[st.id] || 0;
              const tc = TC[st.id];
              const isOpen = expandedTopic === st.id;

              return (
                <div key={st.id} style={{ ...cardS, marginBottom: 8, padding: 0, overflow: "hidden" }}>
                  <button onClick={() => setExpandedTopic(isOpen ? null : st.id)} style={{
                    width: "100%", background: "none", border: "none",
                    padding: mobile ? "10px 12px" : "10px 16px",
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
                        기출 {count}문제
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span onClick={(e) => {
                        e.stopPropagation();
                        navigateTo("teaching", { subtopicId: st.id, fromView: "papers" });
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

                  {isOpen && (
                    <InteractiveQuestionList
                      questions={getPastQuestionsBySubtopic(st.id)}
                      color={color}
                    />
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ── Interactive Question (single question with input + grading) ──
function InteractiveQuestion({ q, color, qKey }) {
  const [progress, setProgress] = useState(loadPPProgress);
  const saved = progress[qKey];
  const [userAnswer, setUserAnswer] = useState(saved?.answer || "");
  const [showMs, setShowMs] = useState(!!saved);

  const isAutoGradable = q.answerType === "mc" || (q.answerType === "short" && q.answer);
  const hasMarkScheme = q.markScheme && q.markScheme.length > 5;

  const handleSubmit = () => {
    if (!userAnswer.trim()) return;
    let correct = null;

    if (q.answerType === "mc" && q.answer) {
      correct = userAnswer.trim().toUpperCase() === q.answer.trim().toUpperCase();
    } else if (q.answerType === "short" && q.answer) {
      const norm = userAnswer.trim().toLowerCase();
      const ans = q.answer.trim().toLowerCase();
      correct = norm === ans || norm.includes(ans) || ans.includes(norm);
    }

    const newProgress = {
      ...progress,
      [qKey]: { answer: userAnswer, correct, timestamp: Date.now() },
    };
    setProgress(newProgress);
    savePPProgress(newProgress);
    setShowMs(true);
  };

  const handleReset = () => {
    const newProgress = { ...progress };
    delete newProgress[qKey];
    setProgress(newProgress);
    savePPProgress(newProgress);
    setUserAnswer("");
    setShowMs(false);
  };

  return (
    <div style={{
      padding: "14px 0",
      borderTop: `1px solid ${C.border}`,
    }}>
      {/* Question header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontWeight: 700, color, fontSize: 12 }}>
          {q.paper} Q{q.qNum}
        </span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {saved && (
            <span style={{
              fontSize: 11, fontWeight: 600,
              color: saved.correct === true ? C.green : saved.correct === false ? C.red : C.orange,
              background: saved.correct === true ? C.greenLight : saved.correct === false ? C.redLight : C.orangeLight,
              borderRadius: 10, padding: "2px 8px",
            }}>
              {saved.correct === true ? "정답" : saved.correct === false ? "오답" : "제출됨"}
            </span>
          )}
          <span style={{
            fontSize: 11, color: C.sub,
            background: C.border, borderRadius: 10, padding: "2px 8px",
          }}>{q.marks}점</span>
        </div>
      </div>

      {/* Question text + inline answer for MC/short */}
      {(() => {
        const isInline = q.answerType === "mc" || q.marks <= 2;
        return (
          <div style={{
            display: isInline ? "flex" : "block",
            gap: isInline ? 12 : 0,
            alignItems: isInline ? "flex-start" : undefined,
          }}>
            {/* Question text */}
            <div style={{ color: C.text, fontSize: 14, lineHeight: 1.8, marginBottom: isInline ? 0 : 10, flex: isInline ? 1 : undefined }}>
              {cleanQText(q.context) && (
                <div style={{
                  color: C.sub, marginBottom: 8, fontSize: 13, fontStyle: "italic",
                  background: C.border + "40", padding: "6px 10px", borderRadius: 6,
                  lineHeight: 1.7,
                }}>
                  {cleanQText(q.context).slice(0, 300)}
                  {cleanQText(q.context).length > 300 ? "..." : ""}
                </div>
              )}
              <RenderQText text={q.text} />
            </div>

            {/* Inline answer area (MC / short ≤2 marks) */}
            {isInline && (
              <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, paddingTop: 2 }}>
                {!saved ? (
                  <>
                    {q.answerType === "mc" ? (
                      <div style={{ display: "flex", gap: 4 }}>
                        {["A", "B", "C", "D"].map(opt => (
                          <button key={opt} onClick={() => { setUserAnswer(opt); }} style={{
                            ...btnS,
                            width: 34, height: 34, padding: 0,
                            fontSize: 13, fontWeight: 700,
                            background: userAnswer === opt ? color : C.border + "80",
                            color: userAnswer === opt ? "#fff" : C.text,
                          }}>
                            {opt}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <input
                        value={userAnswer}
                        onChange={e => setUserAnswer(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSubmit()}
                        placeholder="답 입력"
                        style={{
                          width: 120, padding: "6px 8px", borderRadius: 8,
                          border: `1px solid ${C.border}`, fontSize: 13,
                          fontFamily: F, background: C.white, color: C.text,
                          textAlign: "center",
                        }}
                      />
                    )}
                    <button onClick={handleSubmit} disabled={!userAnswer.trim()} style={{
                      ...btnS, padding: "5px 12px", fontSize: 12,
                      background: userAnswer.trim() ? color : C.border,
                      color: userAnswer.trim() ? "#fff" : C.sub,
                      opacity: userAnswer.trim() ? 1 : 0.6,
                      width: "100%",
                    }}>
                      제출
                    </button>
                  </>
                ) : (
                  <div style={{ textAlign: "right" }}>
                    <div style={{
                      padding: "5px 10px", borderRadius: 8, fontSize: 12, marginBottom: 4,
                      background: saved.correct === true ? "#ECFDF5" : saved.correct === false ? "#FEF2F2" : "#FFF7ED",
                      border: `1px solid ${saved.correct === true ? C.green + "40" : saved.correct === false ? C.red + "40" : C.orange + "40"}`,
                      color: C.text, whiteSpace: "nowrap",
                    }}>
                      <span style={{ fontWeight: 600 }}>{saved.answer}</span>
                      {saved.correct === true && <span style={{ color: C.green, marginLeft: 4 }}>✓</span>}
                      {saved.correct === false && (
                        <span style={{ color: C.red, marginLeft: 4 }}>✗ {q.answer}</span>
                      )}
                    </div>
                    <button onClick={handleReset} style={{
                      ...btnS, fontSize: 10, padding: "3px 8px",
                      background: C.border + "60", color: C.sub,
                    }}>
                      다시 풀기
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* Below-question answer area (long answer, marks > 2) */}
      {!(q.answerType === "mc" || q.marks <= 2) && (
        <>
          {!saved ? (
            <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
              <textarea
                value={userAnswer}
                onChange={e => setUserAnswer(e.target.value)}
                placeholder="답을 입력하세요..."
                rows={q.marks > 3 ? 4 : 2}
                style={{
                  flex: 1, padding: "8px 10px", borderRadius: 8,
                  border: `1px solid ${C.border}`, fontSize: 13,
                  fontFamily: F, resize: "vertical", background: C.white,
                  color: C.text,
                }}
              />
              <button onClick={handleSubmit} disabled={!userAnswer.trim()} style={{
                ...btnS, padding: "8px 14px",
                background: userAnswer.trim() ? color : C.border,
                color: userAnswer.trim() ? "#fff" : C.sub,
                opacity: userAnswer.trim() ? 1 : 0.6,
              }}>
                제출
              </button>
            </div>
          ) : (
            <div>
              <div style={{
                padding: "8px 12px", borderRadius: 8, fontSize: 13, marginBottom: 8,
                background: saved.correct === true ? "#ECFDF5" : saved.correct === false ? "#FEF2F2" : "#FFF7ED",
                border: `1px solid ${saved.correct === true ? C.green + "40" : saved.correct === false ? C.red + "40" : C.orange + "40"}`,
                color: C.text,
              }}>
                <span style={{ fontWeight: 600 }}>내 답: </span>{saved.answer}
                {saved.correct === true && <span style={{ color: C.green, marginLeft: 8 }}>✓ 정답</span>}
                {saved.correct === false && (
                  <span style={{ color: C.red, marginLeft: 8 }}>✗ 정답: {q.answer}</span>
                )}
              </div>
              <button onClick={handleReset} style={{
                ...btnS, fontSize: 11, padding: "4px 10px",
                background: C.border + "60", color: C.sub,
              }}>
                다시 풀기
              </button>
            </div>
          )}
        </>
      )}

      {/* Mark scheme toggle */}
      {hasMarkScheme && showMs && (
        <div style={{ marginTop: 8 }}>
          <MarkSchemeDisplay markScheme={q.markScheme} acceptedAnswers={q.acceptedAnswers} />
        </div>
      )}
      {hasMarkScheme && !showMs && saved && (
        <button onClick={() => setShowMs(true)} style={{
          ...btnS, fontSize: 11, marginTop: 6,
          background: C.orangeLight, color: "#92400E",
        }}>
          📋 마크스킴 보기
        </button>
      )}
    </div>
  );
}

// ── Mark Scheme Display ──
function MarkSchemeDisplay({ markScheme, acceptedAnswers }) {
  return (
    <div style={{
      padding: "10px 12px", borderRadius: 8,
      background: "#FFFBEB", border: `1px solid ${C.orange}30`,
      fontSize: 12, lineHeight: 1.6,
    }}>
      <div style={{ fontWeight: 700, color: "#92400E", marginBottom: 4 }}>
        📋 Mark Scheme
      </div>
      <div style={{ color: C.text, whiteSpace: "pre-line" }}>
        {cleanQText(markScheme)}
      </div>
      {acceptedAnswers && acceptedAnswers.length > 0 && (
        <div style={{ marginTop: 6 }}>
          <div style={{ fontWeight: 600, color: "#92400E", fontSize: 11 }}>허용 답안:</div>
          {acceptedAnswers.map((a, i) => (
            <div key={i} style={{ color: C.text, paddingLeft: 8 }}>• {a}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Interactive Question List (for subtopic view) ──
function InteractiveQuestionList({ questions, color }) {
  const valid = questions.filter(isValidQuestion);
  if (valid.length === 0) {
    return (
      <div style={{ padding: "12px 16px", color: C.sub, fontSize: 13 }}>
        이 소주제의 기출문제가 없습니다
      </div>
    );
  }

  return (
    <div style={{ padding: "0 16px 12px", maxHeight: 600, overflow: "auto" }}>
      {valid.slice(0, 20).map((q, idx) => (
        <InteractiveQuestion
          key={`${q.qpFile}-${q.qNum}-${idx}`}
          q={q}
          color={color}
          qKey={`${q.qpFile}-${q.qNum}`}
        />
      ))}
      {questions.length > 20 && (
        <div style={{
          textAlign: "center", padding: 12, color: C.sub, fontSize: 12,
        }}>
          +{questions.length - 20}개 더 (시험지별 보기에서 전체 확인 가능)
        </div>
      )}
    </div>
  );
}

// ── Paper List View (시험지별) ──
function PaperListView({ papers, expandedPaper, setExpandedPaper, mobile }) {
  const SESSION_COLORS = { s: C.blue, w: C.orange, m: C.green };
  const SESSION_LABELS = { s: "May/Jun", w: "Oct/Nov", m: "Mar" };

  return (
    <div>
      {papers.map((p, idx) => {
        const isOpen = expandedPaper === idx;
        const sColor = SESSION_COLORS[p.session] || C.border;
        return (
          <div key={idx} style={{
            ...cardS,
            borderLeft: `4px solid ${sColor}`,
            padding: 0, marginBottom: 8, overflow: "hidden",
          }}>
            <button onClick={() => setExpandedPaper(isOpen ? null : idx)} style={{
              width: "100%", background: "none", border: "none",
              padding: "12px 16px", cursor: "pointer", fontFamily: F,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: C.text }}>
                  {p.label}
                </div>
                <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>
                  Paper {p.paper} · {p.questions.length}문제 · {p.totalMarks}점
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  color: sColor, background: sColor + "15",
                  borderRadius: 10, padding: "2px 8px",
                }}>
                  {SESSION_LABELS[p.session]}
                </span>
                <span style={{
                  fontSize: 14, color: C.sub,
                  transform: isOpen ? "rotate(180deg)" : "rotate(0)",
                  transition: "transform .2s", display: "inline-block",
                }}>▼</span>
              </div>
            </button>

            {isOpen && (
              <div style={{ padding: "0 16px 12px" }}>
                {p.questions.filter(isValidQuestion).map((q, qi) => (
                  <InteractiveQuestion
                    key={`${p.qpFile}-${q.qNum}-${qi}`}
                    q={{ ...q, paper: p.label }}
                    color={sColor}
                    qKey={`${p.qpFile}-${q.qNum}`}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
