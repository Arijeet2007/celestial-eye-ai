import { useEffect, useRef, useState } from "react";
import { MapPin, LocateFixed, Plus, Minus, RotateCw, Loader2 } from "lucide-react";

type Pin = { lat: number; lng: number; label?: string };

type PlaceInfo = {
  name: string;
  city?: string;
  state?: string;
  country?: string;
  countryCode?: string;
  type?: string;
  full?: string;
};

const EARTH_TEXTURES = {
  satellite: "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg",
  night: "//unpkg.com/three-globe/example/img/earth-night.jpg",
  topology: "//unpkg.com/three-globe/example/img/earth-topology.png",
} as const;

type TextureKey = keyof typeof EARTH_TEXTURES;

// Major cities to surface as labels (kept small for perf)
const MAJOR_CITIES: { name: string; lat: number; lng: number }[] = [
  { name: "New York", lat: 40.7128, lng: -74.006 },
  { name: "London", lat: 51.5074, lng: -0.1278 },
  { name: "Paris", lat: 48.8566, lng: 2.3522 },
  { name: "Tokyo", lat: 35.6762, lng: 139.6503 },
  { name: "Beijing", lat: 39.9042, lng: 116.4074 },
  { name: "Mumbai", lat: 19.076, lng: 72.8777 },
  { name: "Delhi", lat: 28.6139, lng: 77.209 },
  { name: "Sydney", lat: -33.8688, lng: 151.2093 },
  { name: "São Paulo", lat: -23.5505, lng: -46.6333 },
  { name: "Cairo", lat: 30.0444, lng: 31.2357 },
  { name: "Moscow", lat: 55.7558, lng: 37.6173 },
  { name: "Dubai", lat: 25.2048, lng: 55.2708 },
  { name: "Singapore", lat: 1.3521, lng: 103.8198 },
  { name: "Los Angeles", lat: 34.0522, lng: -118.2437 },
  { name: "Lagos", lat: 6.5244, lng: 3.3792 },
  { name: "Mexico City", lat: 19.4326, lng: -99.1332 },
  { name: "Buenos Aires", lat: -34.6037, lng: -58.3816 },
  { name: "Istanbul", lat: 41.0082, lng: 28.9784 },
  { name: "Cape Town", lat: -33.9249, lng: 18.4241 },
  { name: "Toronto", lat: 43.6532, lng: -79.3832 },
];

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
  const countriesRef = useRef<any[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pin, setPin] = useState<Pin | null>(initialPin ?? null);
  const [texture, setTexture] = useState<TextureKey>("satellite");
  const [autoRotate, setAutoRotate] = useState(true);
  const [showCities, setShowCities] = useState(true);
  const [showCountries, setShowCountries] = useState(true);
  const [place, setPlace] = useState<PlaceInfo | null>(null);
  const [placeLoading, setPlaceLoading] = useState(false);
  const [altitude, setAltitude] = useState(2.2);

  // Reverse geocode helper
  const reverseGeocode = async (lat: number, lng: number) => {
    setPlaceLoading(true);
    setPlace(null);
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
        { headers: { Accept: "application/json" } }
      );
      if (!r.ok) throw new Error("lookup failed");
      const j = await r.json();
      const a = j.address || {};
      setPlace({
        name: a.city || a.town || a.village || a.hamlet || a.county || a.state || a.country || "Unknown",
        city: a.city || a.town || a.village || a.hamlet,
        state: a.state || a.region,
        country: a.country,
        countryCode: a.country_code,
        type: j.type || j.category,
        full: j.display_name,
      });
    } catch {
      setPlace({ name: "Ocean or unmapped area", full: `${lat.toFixed(3)}°, ${lng.toFixed(3)}°` });
    } finally {
      setPlaceLoading(false);
    }
  };

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
            reverseGeocode(coords.lat, coords.lng);
          });

        const controls = globeInstance.controls();
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.5;
        controls.enableZoom = true;
        controls.addEventListener?.("change", () => {
          const pov = globeInstance.pointOfView();
          setAltitude(pov.altitude);
        });

        globeInstance.pointOfView({ lat: 20, lng: 0, altitude: 2.2 });
        globeRef.current = globeInstance;
        setReady(true);

        // Load countries GeoJSON
        try {
          const res = await fetch(
            "https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson"
          );
          const geo = await res.json();
          if (cancelled) return;
          countriesRef.current = geo.features || [];
          applyCountries();
        } catch {
          // ignore — globe still usable without polygons
        }
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

  // Apply / clear country polygons & labels
  const applyCountries = () => {
    const g = globeRef.current;
    if (!g) return;
    const data = showCountries ? countriesRef.current : [];
    g.polygonsData(data)
      .polygonAltitude(0.006)
      .polygonCapColor(() => "rgba(79, 195, 247, 0.06)")
      .polygonSideColor(() => "rgba(79, 195, 247, 0.12)")
      .polygonStrokeColor(() => "rgba(120, 220, 255, 0.55)")
      .polygonLabel(
        (d: any) =>
          `<div style="background:rgba(10,20,40,0.92);color:#fff;padding:6px 10px;border:1px solid rgba(79,195,247,0.5);border-radius:6px;font-size:12px;font-family:monospace;">
            <div style="font-weight:700;letter-spacing:0.04em">${d.properties.NAME || d.properties.name}</div>
            <div style="opacity:0.7;font-size:10px">${d.properties.CONTINENT || ""}</div>
          </div>`
      )
      .onPolygonClick((d: any) => {
        const name = d?.properties?.NAME || d?.properties?.name;
        if (name) setPlace({ name, country: name, type: "country" });
      });

    // Country name labels (subtle, only when zoomed out enough)
    const countryLabels = showCountries
      ? countriesRef.current
          .filter((f: any) => f?.properties?.NAME)
          .map((f: any) => {
            // approximate centroid from bbox
            const coords = f.geometry?.coordinates || [];
            let lng = 0,
              lat = 0;
            try {
              if (f.geometry.type === "Polygon") {
                const ring = coords[0];
                lng = ring.reduce((s: number, p: number[]) => s + p[0], 0) / ring.length;
                lat = ring.reduce((s: number, p: number[]) => s + p[1], 0) / ring.length;
              } else if (f.geometry.type === "MultiPolygon") {
                const ring = coords[0][0];
                lng = ring.reduce((s: number, p: number[]) => s + p[0], 0) / ring.length;
                lat = ring.reduce((s: number, p: number[]) => s + p[1], 0) / ring.length;
              }
            } catch {
              /* skip */
            }
            return { kind: "country", name: f.properties.NAME, lat, lng };
          })
      : [];

    const cityLabels = showCities
      ? MAJOR_CITIES.map((c) => ({ kind: "city", name: c.name, lat: c.lat, lng: c.lng }))
      : [];

    const all = [...countryLabels, ...cityLabels];

    g.labelsData(all)
      .labelLat((d: any) => d.lat)
      .labelLng((d: any) => d.lng)
      .labelText((d: any) => d.name)
      .labelSize((d: any) => (d.kind === "country" ? 0.55 : 0.4))
      .labelDotRadius((d: any) => (d.kind === "city" ? 0.25 : 0))
      .labelColor((d: any) => (d.kind === "country" ? "rgba(180,230,255,0.85)" : "rgba(255,220,140,0.95)"))
      .labelResolution(2)
      .labelAltitude(0.008);
  };

  // Re-apply when toggles change
  useEffect(() => {
    if (ready) applyCountries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCities, showCountries, ready]);

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
    const points = pin ? [{ lat: pin.lat, lng: pin.lng, label: pin.label }] : [];
    globeRef.current
      .htmlElementsData(points)
      .htmlLat((d: any) => d.lat)
      .htmlLng((d: any) => d.lng)
      .htmlAltitude(0.01)
      .htmlElement(() => {
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
        globeRef.current?.pointOfView({ lat: p.lat, lng: p.lng, altitude: 1.2 }, 1200);
        reverseGeocode(p.lat, p.lng);
      },
      () => {
        const p = { lat: 37.7749, lng: -122.4194, label: "My Location (default)" };
        setPin(p);
        onPinChange?.(p);
        globeRef.current?.pointOfView({ lat: p.lat, lng: p.lng, altitude: 1.2 }, 1200);
        reverseGeocode(p.lat, p.lng);
      }
    );
  };

  const zoom = (factor: number) => {
    const g = globeRef.current;
    if (!g) return;
    const pov = g.pointOfView();
    const next = Math.max(0.3, Math.min(4, pov.altitude * factor));
    g.pointOfView({ ...pov, altitude: next }, 400);
    setAltitude(next);
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
      <div className="absolute left-3 top-3 flex flex-col gap-1.5">
        <div className="flex gap-1 rounded-md border border-border bg-background/70 p-1 backdrop-blur">
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
        <div className="flex gap-1 rounded-md border border-border bg-background/70 p-1 backdrop-blur">
          <button
            onClick={() => setShowCountries((v) => !v)}
            className={`rounded px-2 py-1 text-[10px] uppercase tracking-widest ${
              showCountries ? "bg-primary/80 text-background" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Countries
          </button>
          <button
            onClick={() => setShowCities((v) => !v)}
            className={`rounded px-2 py-1 text-[10px] uppercase tracking-widest ${
              showCities ? "bg-primary/80 text-background" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Cities
          </button>
        </div>
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
              setPlace(null);
              onPinChange?.(null);
            }}
            title="Clear pin"
            className="grid h-8 w-8 place-items-center rounded-md border border-border bg-background/70 text-danger backdrop-blur hover:border-danger"
          >
            <MapPin className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Altitude indicator */}
      <div className="absolute bottom-3 right-3 rounded-md border border-border bg-background/70 px-2 py-1 font-mono text-[10px] text-muted-foreground backdrop-blur">
        ALT {altitude.toFixed(2)}
      </div>

      {/* Place info panel */}
      {(pin || place || placeLoading) && (
        <div className="absolute bottom-3 left-3 max-w-[300px] rounded-lg border border-border bg-background/85 p-3 backdrop-blur">
          <div className="flex items-center gap-2 text-xs">
            <MapPin className="h-3.5 w-3.5 text-danger" />
            {placeLoading ? (
              <span className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> Identifying location…
              </span>
            ) : (
              <span className="font-semibold">{place?.name ?? pin?.label ?? "Pinned"}</span>
            )}
          </div>
          {place && (
            <div className="mt-1.5 space-y-0.5 text-[11px] text-muted-foreground">
              {place.city && <div><span className="text-foreground/70">City:</span> {place.city}</div>}
              {place.state && <div><span className="text-foreground/70">State:</span> {place.state}</div>}
              {place.country && (
                <div>
                  <span className="text-foreground/70">Country:</span> {place.country}
                  {place.countryCode && (
                    <span className="ml-1 uppercase text-primary">[{place.countryCode}]</span>
                  )}
                </div>
              )}
              {place.type && <div className="opacity-70">Type: {place.type}</div>}
            </div>
          )}
          {pin && (
            <div className="mt-1.5 font-mono text-[10px] text-muted-foreground">
              {pin.lat.toFixed(4)}°, {pin.lng.toFixed(4)}°
            </div>
          )}
        </div>
      )}
    </div>
  );
}
