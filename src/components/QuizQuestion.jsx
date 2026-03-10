import { useState } from "react";
import { C, F, cardS } from "../constants";
import { useIsMobile } from "../hooks";

export default function QuizQuestion({ question, index, userAnswer, onAnswer, submitted }) {
  const mobile = useIsMobile();
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const { id, type, q, options, answer, accept, marks, hint, explanation, explanationTitle } = question;

  // Determine if multi-select MC (answer array length > 1)
  const isMultiSelect = type === "mc" && Array.isArray(answer) && answer.length > 1;

  // Check correctness after submission
  const isCorrect = (() => {
    if (!submitted || userAnswer == null) return false;
    if (type === "mc") {
      if (!Array.isArray(userAnswer)) return false;
      if (userAnswer.length !== answer.length) return false;
      const sorted1 = [...userAnswer].sort();
      const sorted2 = [...answer].sort();
      return sorted1.every((v, i) => v === sorted2[i]);
    }
    if (type === "input") {
      const trimmed = String(userAnswer).trim();
      if (trimmed === String(answer)) return true;
      if (accept && accept.some(a => trimmed.toLowerCase() === String(a).toLowerCase())) return true;
      return false;
    }
    return false;
  })();

  const hasAnswered = (() => {
    if (userAnswer == null) return false;
    if (type === "mc") return Array.isArray(userAnswer) && userAnswer.length > 0;
    if (type === "input") return String(userAnswer).trim().length > 0;
    return false;
  })();

  const borderColor = !submitted
    ? C.blue
    : isCorrect
      ? C.green
      : C.red;

  const handleMcClick = (optIdx) => {
    if (submitted) return;
    if (isMultiSelect) {
      const current = Array.isArray(userAnswer) ? [...userAnswer] : [];
      const idx = current.indexOf(optIdx);
      if (idx >= 0) {
        current.splice(idx, 1);
      } else {
        current.push(optIdx);
      }
      onAnswer(current);
    } else {
      onAnswer([optIdx]);
    }
  };

  const handleInputChange = (e) => {
    if (submitted) return;
    onAnswer(e.target.value);
  };

  // Split question text on newlines
  const qLines = q.split("\n");

  // Detect code-like text (contains binary, hex patterns, or explicit markers)
  const isCodeLine = (line) => /^[01]{4,}$|^[0-9A-Fa-f]{2,}$|^\s{2,}/.test(line.trim());

  return (
    <div style={{
      ...cardS,
      borderLeft: `4px solid ${borderColor}`,
      marginBottom: 16,
      transition: "border-color 0.3s ease",
    }}>
      {/* Header: Question number, marks, correctness */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{
            background: borderColor,
            color: "#fff",
            fontWeight: 800,
            fontSize: 13,
            borderRadius: 8,
            padding: "4px 10px",
            fontFamily: F,
            minWidth: 32,
            textAlign: "center",
          }}>
            {index + 1}
          </span>
          {submitted && (
            <span style={{ fontSize: 20 }}>
              {isCorrect ? "\u2705" : "\u274C"}
            </span>
          )}
        </div>
        <span style={{
          fontSize: 12,
          fontWeight: 700,
          color: C.sub,
          background: "#F3F4F6",
          borderRadius: 6,
          padding: "3px 8px",
        }}>
          {marks} mark{marks > 1 ? "s" : ""}
        </span>
      </div>

      {/* Question text */}
      <div style={{ marginBottom: 16 }}>
        {qLines.map((line, li) => (
          <p key={li} style={{
            margin: li === 0 ? 0 : "6px 0 0 0",
            fontSize: mobile ? 14 : 15,
            lineHeight: 1.6,
            color: C.text,
            fontWeight: li === 0 ? 600 : 400,
            fontFamily: isCodeLine(line) ? "'Fira Code', 'Cascadia Code', monospace" : F,
            background: isCodeLine(line) ? "#F8F7FF" : "transparent",
            padding: isCodeLine(line) ? "2px 6px" : 0,
            borderRadius: isCodeLine(line) ? 4 : 0,
          }}>
            {line || "\u00A0"}
          </p>
        ))}
      </div>

      {/* Multiple choice options */}
      {type === "mc" && options && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {isMultiSelect && !submitted && (
            <p style={{ fontSize: 11, color: C.sub, margin: "0 0 4px 0", fontStyle: "italic" }}>
              {answer.length}개 선택 가능
            </p>
          )}
          {options.map((opt, oi) => {
            const isSelected = Array.isArray(userAnswer) && userAnswer.includes(oi);
            const isCorrectOption = answer.includes(oi);

            let optBg = "#F9FAFB";
            let optBorder = C.border;
            let optTextColor = C.text;

            if (submitted) {
              if (isCorrectOption) {
                optBg = C.greenLight;
                optBorder = C.green;
              } else if (isSelected && !isCorrectOption) {
                optBg = C.redLight;
                optBorder = C.red;
              }
            } else if (isSelected) {
              optBg = C.purpleLight;
              optBorder = C.purple;
            }

            return (
              <button
                key={oi}
                onClick={() => handleMcClick(oi)}
                disabled={submitted}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: `2px solid ${optBorder}`,
                  background: optBg,
                  cursor: submitted ? "default" : "pointer",
                  fontFamily: F,
                  fontSize: mobile ? 13 : 14,
                  color: optTextColor,
                  textAlign: "left",
                  transition: "all 0.15s",
                  opacity: submitted && !isSelected && !isCorrectOption ? 0.6 : 1,
                }}
              >
                {/* Radio / Checkbox indicator */}
                <span style={{
                  width: 20,
                  height: 20,
                  minWidth: 20,
                  borderRadius: isMultiSelect ? 4 : "50%",
                  border: `2px solid ${isSelected ? C.purple : "#D1D5DB"}`,
                  background: isSelected ? C.purple : "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.15s",
                }}>
                  {isSelected && (
                    <span style={{
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 800,
                    }}>
                      {isMultiSelect ? "\u2713" : "\u2022"}
                    </span>
                  )}
                </span>
                <span style={{ lineHeight: 1.4 }}>{opt}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Input field */}
      {type === "input" && (
        <div style={{ marginBottom: 16 }}>
          <input
            type="text"
            value={userAnswer || ""}
            onChange={handleInputChange}
            disabled={submitted}
            placeholder="답을 입력하세요..."
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: 10,
              border: `2px solid ${
                submitted
                  ? isCorrect ? C.green : C.red
                  : userAnswer ? C.purple : C.border
              }`,
              fontSize: mobile ? 14 : 15,
              fontFamily: "'Fira Code', 'Cascadia Code', monospace",
              color: C.text,
              background: submitted
                ? isCorrect ? C.greenLight : C.redLight
                : "#fff",
              outline: "none",
              boxSizing: "border-box",
              transition: "all 0.2s",
            }}
          />
          {submitted && !isCorrect && (
            <p style={{
              fontSize: 13,
              color: C.green,
              fontWeight: 700,
              marginTop: 8,
              marginBottom: 0,
              fontFamily: "'Fira Code', monospace",
            }}>
              {"\u2192"} {answer}
              {accept && accept.length > 1 && (
                <span style={{ fontWeight: 400, color: C.sub, fontFamily: F }}>
                  {" "}(also accepted: {accept.filter(a => a !== answer).join(", ")})
                </span>
              )}
            </p>
          )}
        </div>
      )}

      {/* Hint & Explanation toggle buttons */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {/* Hint button: available before submission */}
        {hint && !submitted && (
          <button
            onClick={() => setShowHint(h => !h)}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              background: showHint ? C.orangeLight : "#F9FAFB",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              color: C.text,
              fontFamily: F,
              transition: "all 0.15s",
            }}
          >
            {"\uD83D\uDCA1"} {showHint ? "힌트 숨기기" : "힌트"}
          </button>
        )}

        {/* Explanation button: available after submission */}
        {submitted && explanation && (
          <button
            onClick={() => setShowExplanation(e => !e)}
            style={{
              padding: "6px 12px",
              borderRadius: 8,
              border: `1px solid ${C.border}`,
              background: showExplanation ? C.blueLight : "#F9FAFB",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              color: C.text,
              fontFamily: F,
              transition: "all 0.15s",
            }}
          >
            {"\uD83D\uDCD6"} {showExplanation ? "풀이 숨기기" : "풀이"}
          </button>
        )}
      </div>

      {/* Hint content */}
      {showHint && hint && !submitted && (
        <div style={{
          marginTop: 10,
          padding: "10px 14px",
          background: C.orangeLight,
          borderRadius: 10,
          fontSize: 13,
          lineHeight: 1.6,
          color: "#92400E",
          border: `1px solid ${C.orange}33`,
        }}>
          {"\uD83D\uDCA1"} {hint}
        </div>
      )}

      {/* Explanation content */}
      {showExplanation && explanation && submitted && (
        <div style={{
          marginTop: 10,
          padding: "10px 14px",
          background: C.blueLight,
          borderRadius: 10,
          fontSize: 13,
          lineHeight: 1.8,
          color: "#1E3A5F",
          border: `1px solid ${C.blue}33`,
          whiteSpace: "pre-wrap",
          fontFamily: "'Fira Code', monospace",
        }}>
          {explanationTitle && (
            <p style={{
              margin: "0 0 6px 0",
              fontWeight: 800,
              fontFamily: F,
              fontSize: 13,
              color: C.blue,
            }}>
              {explanationTitle}
            </p>
          )}
          {explanation}
        </div>
      )}
    </div>
  );
}
