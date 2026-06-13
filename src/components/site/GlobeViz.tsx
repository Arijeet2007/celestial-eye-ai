import { useEffect, useRef, useState } from "react";
import { MapPin, LocateFixed, RotateCw } from "lucide-react";
import { satellites } from "@/lib/mock-data";

type Pin = { lat: number; lng: number; label?: string };
type Props = {
  size?: number;
  showSatellites?: boolean;
  className?: string;
  interactive?: boolean;
};

// Project a (lat, lng) on a rotated sphere to 2D screen coords.
// rotLng rotates around vertical axis, rotLat tilts up/down.
function project(lat: number, lng: number, rotLat: number, rotLng: number, r: number) {
  const φ = (lat * Math.PI) / 180;
  const λ = ((lng + rotLng) * Math.PI) / 180;
  const tilt = (rotLat * Math.PI) / 180;

  // Point on unit sphere (lng around Y, lat around X)
  let x = Math.cos(φ) * Math.sin(λ);
  let y = Math.sin(φ);
  let z = Math.cos(φ) * Math.cos(λ);

  // Apply tilt around X-axis
  const y2 = y * Math.cos(tilt) - z * Math.sin(tilt);
  const z2 = y * Math.sin(tilt) + z * Math.cos(tilt);
  y = y2;
  z = z2;

  return { x: x * r, y: -y * r, visible: z > 0, z };
}

// Inverse: SVG-local (dx, dy) -> (lat, lng) on the sphere considering rotation.
function unproject(dx: number, dy: number, r: number, rotLat: number, rotLng: number) {
  const nx = dx / r;
  const ny = -dy / r;
  const d2 = nx * nx + ny * ny;
  if (d2 > 1) return null;
  const nz = Math.sqrt(1 - d2);

  const tilt = (-rotLat * Math.PI) / 180;
  // Inverse tilt around X
  const y = ny * Math.cos(tilt) - nz * Math.sin(tilt);
  const z = ny * Math.sin(tilt) + nz * Math.cos(tilt);
  const x = nx;

  const lat = (Math.asin(y) * 180) / Math.PI;
  const lng = (Math.atan2(x, z) * 180) / Math.PI - rotLng;
  // Normalize lng to [-180, 180]
  const lngN = ((((lng + 180) % 360) + 360) % 360) - 180;
  return { lat, lng: lngN };
}

export function GlobeViz({
  size = 480,
  showSatellites = true,
  className = "",
  interactive = true,
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.32;

  const svgRef = useRef<SVGSVGElement | null>(null);
  const [rotLng, setRotLng] = useState(20);
  const [rotLat, setRotLat] = useState(-15);
  const [autoSpin, setAutoSpin] = useState(true);
  const [pin, setPin] = useState<Pin | null>(null);
  const [hover, setHover] = useState<{ lat: number; lng: number } | null>(null);

  const drag = useRef<{ x: number; y: number; rl: number; rt: number; moved: boolean } | null>(null);

  // Auto-spin
  useEffect(() => {
    if (!autoSpin) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setRotLng((v) => (v + dt * 6) % 360);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [autoSpin]);

  const getLocal = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { dx: 0, dy: 0 };
    const rect = svg.getBoundingClientRect();
    const sx = ((clientX - rect.left) / rect.width) * size;
    const sy = ((clientY - rect.top) / rect.height) * size;
    return { dx: sx - cx, dy: sy - cy };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, rl: rotLng, rt: rotLat, moved: false };
    setAutoSpin(false);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (interactive && drag.current) {
      const ddx = e.clientX - drag.current.x;
      const ddy = e.clientY - drag.current.y;
      if (Math.abs(ddx) + Math.abs(ddy) > 3) drag.current.moved = true;
      setRotLng(drag.current.rl + ddx * 0.4);
      setRotLat(Math.max(-80, Math.min(80, drag.current.rt - ddy * 0.4)));
    }
    if (interactive) {
      const { dx, dy } = getLocal(e.clientX, e.clientY);
      const p = unproject(dx, dy, r, rotLat, rotLng);
      setHover(p);
    }
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!interactive) return;
    const wasDrag = drag.current?.moved;
    drag.current = null;
    if (!wasDrag) {
      const { dx, dy } = getLocal(e.clientX, e.clientY);
      const p = unproject(dx, dy, r, rotLat, rotLng);
      if (p) setPin({ ...p, label: "Pinned Location" });
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPin({ lat: pos.coords.latitude, lng: pos.coords.longitude, label: "My Location" });
        setAutoSpin(false);
        // Bring pin to front by rotating globe
        setRotLng(-pos.coords.longitude);
        setRotLat(-pos.coords.latitude * 0.6);
      },
      () => {
        setPin({ lat: 37.7749, lng: -122.4194, label: "My Location (default)" });
      },
      { enableHighAccuracy: false, timeout: 5000 }
    );
  };

  const latitudes = [-60, -30, 0, 30, 60];
  const longitudes = Array.from({ length: 12 }, (_, i) => i * 30);

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      {/* Outer glow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background:
            "radial-gradient(circle, oklch(0.78 0.18 230 / 0.35) 0%, transparent 65%)",
          filter: "blur(20px)",
        }}
      />

      <svg
        ref={svgRef}
        viewBox={`0 0 ${size} ${size}`}
        className={`absolute inset-0 ${interactive ? "cursor-grab active:cursor-grabbing" : ""}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={() => {
          drag.current = null;
          setHover(null);
        }}
      >
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
        </defs>

        {/* Atmosphere */}
        <circle cx={cx} cy={cy} r={r * 1.15} fill="url(#atmo-grad)" />
        {/* Earth */}
        <circle cx={cx} cy={cy} r={r} fill="url(#earth-grad)" />

        {/* Lat lines (parallels) projected as curves of points */}
        <g fill="none" stroke="oklch(0.78 0.18 230 / 0.28)" strokeWidth="0.6">
          {latitudes.map((lat) => {
            const pts: string[] = [];
            for (let lng = -180; lng <= 180; lng += 6) {
              const p = project(lat, lng, rotLat, rotLng, r);
              if (p.visible) pts.push(`${cx + p.x},${cy + p.y}`);
              else if (pts.length) {
                pts.push("M");
              }
            }
            // Build poly segments split by "M"
            const segs = pts.join(" ").split(" M ").filter(Boolean);
            return segs.map((seg, i) => (
              <polyline key={`lat-${lat}-${i}`} points={seg} />
            ));
          })}
        </g>
        {/* Long lines (meridians) */}
        <g fill="none" stroke="oklch(0.78 0.18 230 / 0.22)" strokeWidth="0.5">
          {longitudes.map((lng) => {
            const pts: string[] = [];
            for (let lat = -90; lat <= 90; lat += 6) {
              const p = project(lat, lng, rotLat, rotLng, r);
              if (p.visible) pts.push(`${cx + p.x},${cy + p.y}`);
              else if (pts.length) pts.push("M");
            }
            const segs = pts.join(" ").split(" M ").filter(Boolean);
            return segs.map((seg, i) => (
              <polyline key={`lng-${lng}-${i}`} points={seg} />
            ));
          })}
        </g>

        {/* Orbital rings (decorative, fixed) */}
        {[1.35, 1.6, 1.9].map((mult, i) => (
          <g key={i}>
            <ellipse
              cx={cx}
              cy={cy}
              rx={r * mult}
              ry={r * mult * 0.35}
              fill="none"
              stroke="oklch(0.78 0.18 230 / 0.35)"
              strokeWidth="1"
              transform={`rotate(${i * 30 + rotLng * 0.2} ${cx} ${cy})`}
            />
          </g>
        ))}

        {/* Satellite markers projected onto sphere */}
        {showSatellites &&
          satellites.slice(0, 10).map((s) => {
            const p = project(s.lat, s.lng, rotLat, rotLng, r * 1.04);
            if (!p.visible) return null;
            return (
              <g key={s.id}>
                <circle
                  cx={cx + p.x}
                  cy={cy + p.y}
                  r="3"
                  fill="oklch(0.84 0.16 210)"
                >
                  <animate
                    attributeName="opacity"
                    values="0.5;1;0.5"
                    dur="2.4s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            );
          })}

        {/* Pin */}
        {pin && (() => {
          const p = project(pin.lat, pin.lng, rotLat, rotLng, r);
          if (!p.visible) return null;
          const px = cx + p.x;
          const py = cy + p.y;
          return (
            <g>
              <circle cx={px} cy={py} r="10" fill="oklch(0.7 0.22 25 / 0.25)">
                <animate attributeName="r" values="6;14;6" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.6;0;0.6" dur="2s" repeatCount="indefinite" />
              </circle>
              <path
                d={`M ${px} ${py - 14} C ${px - 7} ${py - 14}, ${px - 7} ${py - 4}, ${px} ${py} C ${px + 7} ${py - 4}, ${px + 7} ${py - 14}, ${px} ${py - 14} Z`}
                fill="oklch(0.7 0.22 25)"
                stroke="oklch(0.95 0.05 25)"
                strokeWidth="1"
              />
              <circle cx={px} cy={py - 10} r="2.5" fill="oklch(0.98 0 0)" />
            </g>
          );
        })()}
      </svg>

      {/* Overlay UI */}
      {interactive && (
        <>
          <div className="pointer-events-none absolute left-3 top-3 rounded-md border border-border bg-background/60 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground backdrop-blur">
            {hover
              ? `${hover.lat.toFixed(2)}°, ${hover.lng.toFixed(2)}°`
              : "drag · click to pin"}
          </div>

          <div className="absolute right-3 top-3 flex flex-col gap-1.5">
            <button
              onClick={useMyLocation}
              title="Use my location"
              className="pointer-events-auto grid h-8 w-8 place-items-center rounded-md border border-border bg-background/60 text-primary backdrop-blur hover:border-primary hover:bg-primary/10"
            >
              <LocateFixed className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setAutoSpin((s) => !s)}
              title={autoSpin ? "Pause rotation" : "Auto-rotate"}
              className={`pointer-events-auto grid h-8 w-8 place-items-center rounded-md border bg-background/60 backdrop-blur hover:bg-primary/10 ${
                autoSpin ? "border-primary text-primary" : "border-border text-muted-foreground"
              }`}
            >
              <RotateCw className="h-3.5 w-3.5" />
            </button>
            {pin && (
              <button
                onClick={() => setPin(null)}
                title="Clear pin"
                className="pointer-events-auto grid h-8 w-8 place-items-center rounded-md border border-border bg-background/60 text-danger backdrop-blur hover:border-danger hover:bg-danger/10"
              >
                <MapPin className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {pin && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-lg border border-border bg-background/70 px-3 py-1.5 text-center backdrop-blur">
              <div className="flex items-center gap-2 text-xs">
                <MapPin className="h-3.5 w-3.5 text-danger" />
                <span className="font-semibold">{pin.label}</span>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {pin.lat.toFixed(3)}°, {pin.lng.toFixed(3)}°
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
