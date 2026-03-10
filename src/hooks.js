import { useState, useEffect } from "react";

export function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(window.innerWidth <= breakpoint);
  useEffect(() => {
    const h = () => setMobile(window.innerWidth <= breakpoint);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, [breakpoint]);
  return mobile;
}

const STORAGE_KEY = "igcse-0478-progress";

const defaultProgress = {
  studiedConcepts: {},
  completedPapers: {},
  quizHistory: [],
};

export function useProgress() {
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultProgress, ...JSON.parse(saved) } : defaultProgress;
    } catch { return defaultProgress; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const toggleConcept = (subtopicId, conceptIdx) => {
    setProgress(p => {
      const concepts = { ...p.studiedConcepts };
      const key = `${subtopicId}`;
      const arr = concepts[key] ? [...concepts[key]] : [];
      arr[conceptIdx] = !arr[conceptIdx];
      concepts[key] = arr;
      return { ...p, studiedConcepts: concepts };
    });
  };

  const isConceptStudied = (subtopicId, conceptIdx) => {
    const arr = progress.studiedConcepts[subtopicId];
    return arr ? !!arr[conceptIdx] : false;
  };

  const getSubtopicProgress = (subtopicId, totalConcepts) => {
    const arr = progress.studiedConcepts[subtopicId];
    if (!arr) return 0;
    const done = arr.filter(Boolean).length;
    return totalConcepts > 0 ? Math.round((done / totalConcepts) * 100) : 0;
  };

  const togglePaperCompleted = (filename) => {
    setProgress(p => {
      const papers = { ...p.completedPapers };
      if (papers[filename]) {
        delete papers[filename];
      } else {
        papers[filename] = { completedAt: new Date().toISOString() };
      }
      return { ...p, completedPapers: papers };
    });
  };

  const isPaperCompleted = (filename) => !!progress.completedPapers[filename];

  const saveQuizScore = (topicId, score, total) => {
    setProgress(p => ({
      ...p,
      quizHistory: [
        ...p.quizHistory,
        { topicId, score, total, date: new Date().toISOString() },
      ],
    }));
  };

  const getTopicBestScore = (topicId) => {
    const scores = progress.quizHistory.filter(h => h.topicId === topicId);
    if (scores.length === 0) return null;
    return scores.reduce((best, s) =>
      (s.score / s.total) > (best.score / best.total) ? s : best
    );
  };

  const getOverallStats = () => {
    const totalConcepts = Object.values(progress.studiedConcepts)
      .reduce((sum, arr) => sum + arr.filter(Boolean).length, 0);
    const totalPapers = Object.keys(progress.completedPapers).length;
    const totalQuizzes = progress.quizHistory.length;
    return { totalConcepts, totalPapers, totalQuizzes };
  };

  return {
    progress, toggleConcept, isConceptStudied, getSubtopicProgress,
    togglePaperCompleted, isPaperCompleted,
    saveQuizScore, getTopicBestScore, getOverallStats,
  };
}
