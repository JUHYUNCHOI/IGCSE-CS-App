import { useState } from "react";
import { C, F, cardS } from "../constants";
import { useIsMobile } from "../hooks";
import syllabusData from "../data/syllabus_topics.json";

const PAPER_COLORS = {
  1: { accent: C.purple, light: C.purpleLight, label: "Paper 1" },
  2: { accent: C.blue, light: C.blueLight, label: "Paper 2" },
};

function ProgressBar({ percent, color, height = 6 }) {
  return (
    <div style={{
      width: "100%",
      height,
      background: C.border,
      borderRadius: height,
      overflow: "hidden",
    }}>
      <div style={{
        width: `${percent}%`,
        height: "100%",
        background: color,
        borderRadius: height,
        transition: "width 0.3s ease",
      }} />
    </div>
  );
}

function ConceptCheckbox({ checked, label, onToggle }) {
  return (
    <label
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "8px 0",
        cursor: "pointer",
        fontSize: 13,
        color: checked ? C.sub : C.text,
        textDecoration: checked ? "line-through" : "none",
        lineHeight: 1.5,
        transition: "color 0.15s",
      }}
    >
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 20,
        height: 20,
        minWidth: 20,
        borderRadius: 6,
        border: checked ? "none" : `2px solid ${C.border}`,
        background: checked ? C.purple : C.white,
        color: "#fff",
        fontSize: 12,
        fontWeight: 800,
        transition: "all 0.15s",
        marginTop: 1,
      }}>
        {checked ? "\u2713" : ""}
      </span>
      <span>{label}</span>
    </label>
  );
}

function SubtopicCard({
  subtopic,
  paperAccent,
  toggleConcept,
  isConceptStudied,
  getSubtopicProgress,
}) {
  const [expanded, setExpanded] = useState(false);
  const total = subtopic.key_concepts.length;
  const progress = getSubtopicProgress(subtopic.id, total);
  const allDone = progress === 100;

  return (
    <div style={{
      background: C.white,
      borderRadius: 12,
      border: `1px solid ${expanded ? paperAccent : C.border}`,
      overflow: "hidden",
      transition: "border-color 0.15s",
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "12px 14px",
          background: "none",
          border: "none",
          cursor: "pointer",
          fontFamily: F,
          textAlign: "left",
        }}
      >
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          minWidth: 32,
          borderRadius: 8,
          background: allDone ? C.greenLight : C.bg,
          color: allDone ? C.green : paperAccent,
          fontSize: 12,
          fontWeight: 800,
        }}>
          {allDone ? "\u2713" : subtopic.id}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 13,
            fontWeight: 700,
            color: C.text,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}>
            {subtopic.name}
          </div>
          <div style={{ marginTop: 4 }}>
            <ProgressBar percent={progress} color={allDone ? C.green : paperAccent} height={4} />
          </div>
        </div>

        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          minWidth: "fit-content",
        }}>
          <span style={{
            fontSize: 11,
            color: allDone ? C.green : C.sub,
            fontWeight: 600,
          }}>
            {progress}%
          </span>
          <span style={{
            fontSize: 14,
            color: C.light,
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}>
            \u25BC
          </span>
        </div>
      </button>

      {expanded && (
        <div style={{
          padding: "0 14px 14px 14px",
          borderTop: `1px solid ${C.border}`,
        }}>
          <div style={{
            fontSize: 11,
            color: C.sub,
            fontWeight: 600,
            padding: "10px 0 4px 0",
          }}>
            핵심 개념 ({total}개)
          </div>
          {subtopic.key_concepts.map((concept, idx) => (
            <ConceptCheckbox
              key={idx}
              checked={isConceptStudied(subtopic.id, idx)}
              label={concept}
              onToggle={() => toggleConcept(subtopic.id, idx)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function TopicCard({
  topic,
  paperAccent,
  paperLight,
  expanded,
  onToggle,
  toggleConcept,
  isConceptStudied,
  getSubtopicProgress,
}) {
  const mobile = useIsMobile();

  const totalConcepts = topic.subtopics.reduce(
    (sum, st) => sum + st.key_concepts.length, 0
  );
  const studiedConcepts = topic.subtopics.reduce((sum, st) => {
    const prog = getSubtopicProgress(st.id, st.key_concepts.length);
    return sum + Math.round((prog / 100) * st.key_concepts.length);
  }, 0);
  const topicProgress = totalConcepts > 0
    ? Math.round((studiedConcepts / totalConcepts) * 100)
    : 0;

  return (
    <div style={{
      ...cardS,
      padding: 0,
      overflow: "hidden",
      border: expanded ? `2px solid ${paperAccent}` : `1px solid ${C.border}`,
    }}>
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: mobile ? 10 : 14,
          padding: mobile ? "14px 14px" : "16px 20px",
          background: expanded ? paperLight : C.white,
          border: "none",
          cursor: "pointer",
          fontFamily: F,
          textAlign: "left",
          transition: "background 0.15s",
        }}
      >
        <span style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: mobile ? 36 : 42,
          height: mobile ? 36 : 42,
          minWidth: mobile ? 36 : 42,
          borderRadius: 10,
          background: paperAccent,
          color: "#fff",
          fontSize: mobile ? 14 : 16,
          fontWeight: 800,
        }}>
          {topic.id}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: mobile ? 14 : 15,
            fontWeight: 800,
            color: C.text,
          }}>
            {topic.name}
          </div>
          <div style={{
            fontSize: 11,
            color: C.sub,
            marginTop: 2,
          }}>
            {topic.subtopics.length}개 소주제 &middot; {totalConcepts}개 개념
          </div>
          <div style={{ marginTop: 6, maxWidth: 260 }}>
            <ProgressBar
              percent={topicProgress}
              color={topicProgress === 100 ? C.green : paperAccent}
              height={5}
            />
          </div>
        </div>

        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: 4,
          minWidth: "fit-content",
        }}>
          <span style={{
            fontSize: 13,
            fontWeight: 800,
            color: topicProgress === 100 ? C.green : paperAccent,
          }}>
            {topicProgress}%
          </span>
          <span style={{
            fontSize: 16,
            color: C.light,
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}>
            \u25BC
          </span>
        </div>
      </button>

      {expanded && (
        <div style={{
          padding: mobile ? "8px 12px 16px" : "8px 20px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          background: C.bg,
        }}>
          {topic.subtopics.map(subtopic => (
            <SubtopicCard
              key={subtopic.id}
              subtopic={subtopic}
              paperAccent={paperAccent}
              toggleConcept={toggleConcept}
              isConceptStudied={isConceptStudied}
              getSubtopicProgress={getSubtopicProgress}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function TopicBrowser({
  toggleConcept,
  isConceptStudied,
  getSubtopicProgress,
}) {
  const [expandedTopic, setExpandedTopic] = useState(null);
  const mobile = useIsMobile();

  const handleToggle = (topicId) => {
    setExpandedTopic(prev => prev === topicId ? null : topicId);
  };

  const getOverallPaperProgress = (paperTopicIds) => {
    let total = 0;
    let studied = 0;
    paperTopicIds.forEach(topicId => {
      const topic = syllabusData.topics.find(t => t.id === topicId);
      if (!topic) return;
      topic.subtopics.forEach(st => {
        const count = st.key_concepts.length;
        total += count;
        const prog = getSubtopicProgress(st.id, count);
        studied += Math.round((prog / 100) * count);
      });
    });
    return total > 0 ? Math.round((studied / total) * 100) : 0;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: mobile ? 20 : 28 }}>
      {syllabusData.papers.map(paper => {
        const pc = PAPER_COLORS[paper.paper];
        const paperTopics = syllabusData.topics.filter(t => t.paper === paper.paper);
        const paperProgress = getOverallPaperProgress(paper.topics);

        return (
          <div key={paper.paper}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 12,
              flexWrap: "wrap",
              gap: 8,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "4px 12px",
                  borderRadius: 8,
                  background: pc.accent,
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 800,
                }}>
                  {pc.label}
                </span>
                <span style={{
                  fontSize: mobile ? 14 : 16,
                  fontWeight: 800,
                  color: C.text,
                }}>
                  {paper.name}
                </span>
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
                <div style={{ width: 80 }}>
                  <ProgressBar
                    percent={paperProgress}
                    color={paperProgress === 100 ? C.green : pc.accent}
                    height={5}
                  />
                </div>
                <span style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: paperProgress === 100 ? C.green : pc.accent,
                }}>
                  {paperProgress}%
                </span>
              </div>
            </div>

            <div style={{
              fontSize: 11,
              color: C.sub,
              marginBottom: 10,
            }}>
              {paper.duration_minutes}분 &middot; {paper.marks}점 &middot; {paper.format}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {paperTopics.map(topic => (
                <TopicCard
                  key={topic.id}
                  topic={topic}
                  paperAccent={pc.accent}
                  paperLight={pc.light}
                  expanded={expandedTopic === topic.id}
                  onToggle={() => handleToggle(topic.id)}
                  toggleConcept={toggleConcept}
                  isConceptStudied={isConceptStudied}
                  getSubtopicProgress={getSubtopicProgress}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
