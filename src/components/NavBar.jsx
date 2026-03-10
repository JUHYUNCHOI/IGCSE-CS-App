import { C, F, NAV_ITEMS } from "../constants";

export default function NavBar({ view, setView, mobile }) {
  if (mobile) {
    return (
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: C.white,
        borderTop: `1px solid ${C.border}`,
        display: "flex",
        justifyContent: "space-around",
        padding: "6px 0 env(safe-area-inset-bottom, 6px)",
        zIndex: 100,
      }}>
        {NAV_ITEMS.map(item => {
          const active = view === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setView(item.key)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                padding: "6px 12px",
                fontFamily: F,
                color: active ? C.purple : C.light,
                transition: "color .15s",
              }}
            >
              <span style={{ fontSize: 20 }}>{item.emoji}</span>
              <span style={{
                fontSize: 10,
                fontWeight: active ? 800 : 500,
              }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div style={{
      display: "flex",
      gap: 4,
      marginBottom: 20,
      background: C.white,
      borderRadius: 14,
      padding: 4,
      border: `1px solid ${C.border}`,
    }}>
      {NAV_ITEMS.map(item => {
        const active = view === item.key;
        return (
          <button
            key={item.key}
            onClick={() => setView(item.key)}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: 10,
              background: active ? C.purple : "transparent",
              color: active ? "#fff" : C.sub,
              border: "none",
              cursor: "pointer",
              fontFamily: F,
              fontSize: 14,
              fontWeight: 700,
              transition: "all .15s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <span>{item.emoji}</span> {item.label}
          </button>
        );
      })}
    </div>
  );
}
