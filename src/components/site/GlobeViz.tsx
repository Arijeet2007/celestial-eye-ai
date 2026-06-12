import { satellites } from "@/lib/mock-data";

type Props = { size?: number; showSatellites?: boolean; className?: string };

export function GlobeViz({ size = 480, showSatellites = true, className = "" }: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.32;

  // Latitude / longitude grid lines
  const latitudes = [-60, -30, 0, 30, 60];
  const longitudes = Array.from({ length: 12 }, (_, i) => i * 30);

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Outer glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background: "radial-gradient(circle, oklch(0.78 0.18 230 / 0.35) 0%, transparent 65%)",
          filter: "blur(20px)",
        }}
      />

      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0">
        <defs>
          <radialGradient id="earth-grad" cx="35%" cy="35%" r="75%">
            <stop offset="0%" stopColor="oklch(0.45 0.12 230)" />
            <stop offset="55%" stopColor="oklch(0.25 0.1 260)" />
            <stop offset="100%" stopColor="oklch(0.1 0.06 270)" />
          </radialGradient>
          <radialGradient id="atmo-grad" cx="50%" cy="50%" r="55%">
            <stop offset="80%" stopColor="oklch(0.78 0.18 230 / 0)" />
            <stop offset="95%" stopColor="oklch(0.78 0.18 230 / 0.5)" />
            <stop offset="100%" stopColor="oklch(0.78 0.18 230 / 0)" />
          </radialGradient>
          <linearGradient id="orbit-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="oklch(0.78 0.18 230 / 0)" />
            <stop offset="50%" stopColor="oklch(0.78 0.18 230 / 0.7)" />
            <stop offset="100%" stopColor="oklch(0.78 0.18 230 / 0)" />
          </linearGradient>
        </defs>

        {/* Atmosphere */}
        <circle cx={cx} cy={cy} r={r * 1.15} fill="url(#atmo-grad)" />
        {/* Earth */}
        <circle cx={cx} cy={cy} r={r} fill="url(#earth-grad)" />

        {/* Lat lines */}
        {latitudes.map((lat) => {
          const ry = r * Math.cos((lat * Math.PI) / 180);
          const yOffset = r * Math.sin((lat * Math.PI) / 180);
          return (
            <ellipse
              key={lat}
              cx={cx}
              cy={cy - yOffset}
              rx={ry}
              ry={ry * 0.18}
              fill="none"
              stroke="oklch(0.78 0.18 230 / 0.25)"
              strokeWidth="0.6"
            />
          );
        })}
        {/* Long lines */}
        {longitudes.map((lon) => {
          const rx = Math.abs(r * Math.cos((lon * Math.PI) / 180));
          return (
            <ellipse
              key={lon}
              cx={cx}
              cy={cy}
              rx={rx}
              ry={r}
              fill="none"
              stroke="oklch(0.78 0.18 230 / 0.18)"
              strokeWidth="0.5"
            />
          );
        })}

        {/* Continents — abstract glowing blobs */}
        <g opacity="0.6" fill="oklch(0.6 0.18 165 / 0.4)" stroke="oklch(0.84 0.16 165 / 0.5)" strokeWidth="0.5">
          <path d={`M ${cx - r * 0.5} ${cy - r * 0.2} q ${r * 0.15} -${r * 0.25} ${r * 0.35} -${r * 0.1} q ${r * 0.1} ${r * 0.2} -${r * 0.05} ${r * 0.35} q -${r * 0.2} ${r * 0.05} -${r * 0.3} -${r * 0.1} z`} />
          <path d={`M ${cx + r * 0.05} ${cy - r * 0.45} q ${r * 0.2} -${r * 0.05} ${r * 0.3} ${r * 0.15} q -${r * 0.08} ${r * 0.2} -${r * 0.25} ${r * 0.18} q -${r * 0.15} -${r * 0.05} -${r * 0.05} -${r * 0.28} z`} />
          <path d={`M ${cx - r * 0.15} ${cy + r * 0.15} q ${r * 0.18} ${r * 0.05} ${r * 0.22} ${r * 0.3} q -${r * 0.1} ${r * 0.1} -${r * 0.25} ${r * 0.05} q -${r * 0.1} -${r * 0.15} ${r * 0.03} -${r * 0.4} z`} />
        </g>

        {/* Orbital rings */}
        {[1.35, 1.6, 1.9].map((mult, i) => (
          <g key={i} style={{ transformOrigin: `${cx}px ${cy}px` }} className="animate-orbit" >
            <ellipse
              cx={cx}
              cy={cy}
              rx={r * mult}
              ry={r * mult * 0.35}
              fill="none"
              stroke="url(#orbit-grad)"
              strokeWidth="1"
              transform={`rotate(${i * 30} ${cx} ${cy})`}
            />
            <circle
              cx={cx + r * mult}
              cy={cy}
              r="3"
              fill="oklch(0.84 0.16 210)"
              transform={`rotate(${i * 30} ${cx} ${cy})`}
            >
              <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" />
            </circle>
          </g>
        ))}

        {/* Satellite markers */}
        {showSatellites && satellites.slice(0, 8).map((s, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const dist = r * (0.95 + (i % 3) * 0.05);
          const x = cx + Math.cos(angle) * dist;
          const y = cy + Math.sin(angle) * dist * 0.85;
          return (
            <g key={s.id}>
              <line x1={cx} y1={cy} x2={x} y2={y} stroke="oklch(0.78 0.18 230 / 0.15)" strokeWidth="0.5" strokeDasharray="2 2" />
              <circle cx={x} cy={y} r="3" fill="oklch(0.84 0.16 210)" >
                <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
              </circle>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
