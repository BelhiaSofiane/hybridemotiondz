// Donut chart (pure SVG)
export default function Donut({ segments, size = 120, stroke = 18, label, sublabel }) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    let offset = 0;
    const cx = size / 2;
    const cy = size / 2;
  
    const slices = segments.map((s) => {
      const len = (s.pct / 100) * circ;
      const slice = { ...s, dasharray: `${len} ${circ - len}`, dashoffset: -offset };
      offset += len;
      return slice;
    });
  
    return (
      <div style={{ position: "relative", width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          {/* track */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb22" strokeWidth={stroke} />
          {slices.map((s, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={stroke}
              strokeDasharray={s.dasharray}
              strokeDashoffset={s.dashoffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dasharray 0.8s ease" }}
            />
          ))}
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {label && (
            <span style={{ fontSize: 22, fontWeight: 800, color: "#1e293b", lineHeight: 1 }}>
              {label}
            </span>
          )}
          {sublabel && (
            <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600 }}>{sublabel}</span>
          )}
        </div>
      </div>
    );
  }