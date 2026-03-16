// ── Pill badge ────────────────────────────────────────────────────────────────
export default function Pill({ color, bg, children }) {
    return (
      <span
        style={{
          background: bg,
          color,
          borderRadius: 20,
          padding: "4px 12px",
          fontSize: 12,
          fontWeight: 700,
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {children}
      </span>
    );
  }