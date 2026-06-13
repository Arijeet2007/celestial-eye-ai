import { useEffect, useRef, useState } from "react";
import { MapPin, LocateFixed, Plus, Minus, RotateCw } from "lucide-react";

type Pin = { lat: number; lng: number; label?: string };

const EARTH_TEXTURES = {
  satellite: "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
  night: "//unpkg.com/three-globe/example/img/earth-night.jpg",
  topology: "//unpkg.com/three-globe/example/img/earth-topology.png",
} as const;

type TextureKey = keyof typeof EARTH_TEXTURES;

export function RealisticGlobe({
  className = "",
  size = 520,
  initialPin,
  onPinChange,
}: {
  className?: string;
  size?: number;
  initialPin?: Pin | null;
  onPinChange?: (p: Pin | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const globeRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pin, setPin] = useState<Pin | null>(initialPin ?? null);
  const [texture, setTexture] = useState<TextureKey>("satellite");
  const [autoRotate, setAutoRotate] = useState(true);

  // Init globe
  useEffect(() => {
    let cancelled = false;
    let globeInstance: any = null;

    (async () => {
      try {
        const mod = await import("globe.gl");
        if (cancelled || !containerRef.current) return;
        const Globe = (mod as any).default;

        globeInstance = new Globe(containerRef.current)
          .width(containerRef.current.clientWidth)
          .height(size)
          .backgroundColor("rgba(0,0,0,0)")
          .globeImageUrl(EARTH_TEXTURES[texture])
          .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
          .showAtmosphere(true)
          .atmosphereColor("#4fc3f7")
          .atmosphereAltitude(0.18)
          .onGlobeClick((coords: { lat: number; lng: number }) => {
            const p: Pin = { lat: coords.lat, lng: coords.lng, label: "Pinned Location" };
            setPin(p);
            onPinChange?.(p);
          });

        // Auto-rotate
        const controls = globeInstance.controls();
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
        controls.enableZoom = true;

        globeRef.current = globeInstance;
        setReady(true);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || "Failed to load 3D globe");
      }
    })();

    return () => {
      cancelled = true;
      try {
        globeInstance?._destructor?.();
      } catch {
        // ignore
      }
      globeRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Texture change
  useEffect(() => {
    if (globeRef.current) globeRef.current.globeImageUrl(EARTH_TEXTURES[texture]);
  }, [texture]);

  // Auto-rotate change
  useEffect(() => {
    const c = globeRef.current?.controls();
    if (c) c.autoRotate = autoRotate;
  }, [autoRotate]);

  // Update pin marker
  useEffect(() => {
    if (!globeRef.current) return;
    const points = pin
      ? [{ lat: pin.lat, lng: pin.lng, size: 0.6, color: "#ff3b5c", label: pin.label }]
      : [];
    globeRef.current
      .htmlElementsData(points)
      .htmlLat((d: any) => d.lat)
      .htmlLng((d: any) => d.lng)
      .htmlAltitude(0.01)
      .htmlElement((d: any) => {
        const el = document.createElement("div");
        el.innerHTML = `
          <div style="position:relative;transform:translate(-50%,-100%);pointer-events:none;">
            <div style="width:14px;height:14px;border-radius:50%;background:#ff3b5c;box-shadow:0 0 0 4px rgba(255,59,92,0.35),0 0 20px rgba(255,59,92,0.8);position:absolute;left:-7px;top:-7px;animation:pulse 1.6s ease-out infinite;"></div>
            <svg viewBox="0 0 24 24" width="22" height="22" style="position:absolute;left:-11px;top:-22px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.6));">
              <path d="M12 2 C7 2 4 5.5 4 9.5 C4 15 12 22 12 22 C12 22 20 15 20 9.5 C20 5.5 17 2 12 2 Z" fill="#ff3b5c" stroke="#fff" stroke-width="1.4"/>
              <circle cx="12" cy="9.5" r="3" fill="#fff"/>
            </svg>
          </div>
          <style>@keyframes pulse{0%{transform:scale(0.6);opacity:1}100%{transform:scale(2.4);opacity:0}}</style>
        `;
        return el;
      });
  }, [pin]);

  // Resize handling
  useEffect(() => {
    if (!containerRef.current || !globeRef.current) return;
    const obs = new ResizeObserver(() => {
      const w = containerRef.current?.clientWidth || size;
      globeRef.current?.width(w).height(size);
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [size, ready]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude, label: "My Location" };
        setPin(p);
        onPinChange?.(p);
        globeRef.current?.pointOfView({ lat: p.lat, lng: p.lng, altitude: 1.6 }, 1200);
      },
      () => {
        const p = { lat: 37.7749, lng: -122.4194, label: "My Location (default)" };
        setPin(p);
        onPinChange?.(p);
        globeRef.current?.pointOfView({ lat: p.lat, lng: p.lng, altitude: 1.6 }, 1200);
      }
    );
  };

  const zoom = (factor: number) => {
    const g = globeRef.current;
    if (!g) return;
    const pov = g.pointOfView();
    g.pointOfView({ ...pov, altitude: Math.max(0.3, Math.min(4, pov.altitude * factor)) }, 400);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-xl border border-border ${className}`}
      style={{ height: size, background: "radial-gradient(circle at 50% 50%, #0a1428 0%, #000814 70%)" }}
    >
      <div ref={containerRef} className="absolute inset-0" />

      {!ready && !error && (
        <div className="absolute inset-0 grid place-items-center text-xs text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Loading 3D Earth…
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 grid place-items-center p-4 text-center text-xs text-danger">{error}</div>
      )}

      {/* Texture selector */}
      <div className="absolute left-3 top-3 flex gap-1 rounded-md border border-border bg-background/70 p-1 backdrop-blur">
        {(Object.keys(EARTH_TEXTURES) as TextureKey[]).map((t) => (
          <button
            key={t}
            onClick={() => setTexture(t)}
            className={`rounded px-2 py-1 text-[10px] uppercase tracking-widest ${
              texture === t ? "bg-primary text-background" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="absolute right-3 top-3 flex flex-col gap-1.5">
        <button
          onClick={useMyLocation}
          title="Use my location"
          className="grid h-8 w-8 place-items-center rounded-md border border-border bg-background/70 text-primary backdrop-blur hover:bg-primary/10"
        >
          <LocateFixed className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => setAutoRotate((r) => !r)}
          title={autoRotate ? "Pause rotation" : "Auto-rotate"}
          className={`grid h-8 w-8 place-items-center rounded-md border bg-background/70 backdrop-blur hover:bg-primary/10 ${
            autoRotate ? "border-primary text-primary" : "border-border text-muted-foreground"
          }`}
        >
          <RotateCw className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => zoom(0.7)}
          title="Zoom in"
          className="grid h-8 w-8 place-items-center rounded-md border border-border bg-background/70 text-foreground backdrop-blur hover:bg-primary/10"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => zoom(1.4)}
          title="Zoom out"
          className="grid h-8 w-8 place-items-center rounded-md border border-border bg-background/70 text-foreground backdrop-blur hover:bg-primary/10"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        {pin && (
          <button
            onClick={() => {
              setPin(null);
              onPinChange?.(null);
            }}
            title="Clear pin"
            className="grid h-8 w-8 place-items-center rounded-md border border-border bg-background/70 text-danger backdrop-blur hover:border-danger"
          >
            <MapPin className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {pin && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-lg border border-border bg-background/80 px-3 py-1.5 backdrop-blur">
          <div className="flex items-center gap-2 text-xs">
            <MapPin className="h-3.5 w-3.5 text-danger" />
            <span className="font-semibold">{pin.label}</span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {pin.lat.toFixed(3)}°, {pin.lng.toFixed(3)}°
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
