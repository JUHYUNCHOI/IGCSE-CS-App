import { useIsMobile } from "../hooks";
import { C, F, btnS } from "../constants";

export default function PaperViewer({ paperPath, title, onClose }) {
  const mobile = useIsMobile();

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          inset: mobile ? 8 : 20,
          background: "#fff",
          borderRadius: 16,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: mobile ? "12px 14px" : "14px 20px",
            borderBottom: `1px solid ${C.border}`,
            background: C.bg,
            flexShrink: 0,
            gap: 12,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: mobile ? 14 : 16,
              fontWeight: 800,
              color: C.text,
              fontFamily: F,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
              minWidth: 0,
            }}
          >
            {title}
          </h3>

          <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <a
              href={paperPath}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: C.purple,
                textDecoration: "none",
                fontFamily: F,
                whiteSpace: "nowrap",
              }}
            >
              {mobile ? "새 탭" : "새 탭에서 열기"} &#8599;
            </a>
            <button
              onClick={onClose}
              style={{
                ...btnS,
                padding: "6px 14px",
                background: C.text,
                color: "#fff",
                fontSize: 13,
              }}
            >
              닫기
            </button>
          </div>
        </div>

        {/* PDF iframe */}
        <iframe
          src={paperPath}
          title={title}
          style={{
            flex: 1,
            width: "100%",
            border: "none",
            background: "#f0f0f0",
          }}
        />
      </div>
    </div>
  );
}
