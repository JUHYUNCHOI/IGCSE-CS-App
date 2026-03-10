export const C = {
  bg: "#F5F3FF", white: "#fff",
  purple: "#7C3AED", purpleLight: "#EDE9FE", purpleDark: "#5B21B6",
  blue: "#3B82F6", blueLight: "#DBEAFE",
  green: "#10B981", greenLight: "#D1FAE5",
  red: "#EF4444", redLight: "#FEE2E2",
  orange: "#F59E0B", orangeLight: "#FEF3C7",
  teal: "#0D9488", tealLight: "#CCFBF1",
  text: "#1E1B4B", sub: "#6B7280", light: "#9CA3AF", border: "#E5E7EB",
};

export const F = "'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif";

export const btnS = {
  padding: "8px 16px", borderRadius: 10, border: "none",
  fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: F,
  transition: "all .15s",
};

export const cardS = {
  background: C.white, borderRadius: 16, padding: 20,
  border: `1px solid ${C.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
};

export const NAV_ITEMS = [
  { key: "teaching", emoji: "🏫", label: "수업 모드" },
  { key: "quiz", emoji: "🧠", label: "퀴즈" },
  { key: "pseudocode", emoji: "💻", label: "의사코드" },
  { key: "topics", emoji: "📚", label: "토픽 학습" },
  { key: "papers", emoji: "📄", label: "기출문제" },
  { key: "grading", emoji: "✅", label: "채점 모드" },
];

export const SESSION_LABELS = { s: "May/Jun", w: "Oct/Nov", m: "Mar" };
export const TYPE_LABELS = {
  qp: "시험지", ms: "채점기준", gt: "커트라인", er: "보고서", pm: "Pre-release",
};
export const TYPE_COLORS = {
  qp: C.blue, ms: C.green, gt: C.orange, er: C.purple, pm: C.teal,
};
