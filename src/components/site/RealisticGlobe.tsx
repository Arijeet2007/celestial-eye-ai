import { useEffect, useRef, useState } from "react";
import { MapPin, LocateFixed, Plus, Minus } from "lucide-react";

type Pin = { lat: number; lng: number; label?: string };

declare global {
  interface Window {
    google: any;
    __initRealisticMap?: () => void;
  }
}

let mapsLoader: Promise<void> | null = null;
function loadMaps(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject();
  if (window.google?.maps) return Promise.resolve();
  if (mapsLoader) return mapsLoader;

  mapsLoader = new Promise<void>((resolve, reject) => {
    const key = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY;
    const channel = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID;
    if (!key) {
      reject(new Error("Missing Google Maps browser key"));
      return;
    }
    window.__initRealisticMap = () => resolve();
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&loading=async&callback=__initRealisticMap${
      channel ? `&channel=${channel}` : ""
    }`;
    s.async = true;
    s.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(s);
  });
  return mapsLoader;
}

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
  const mapEl = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pin, setPin] = useState<Pin | null>(initialPin ?? null);
  const [mapType, setMapType] = useState<"satellite" | "hybrid" | "terrain">("hybrid");

  useEffect(() => {
    let cancelled = false;
    loadMaps()
      .then(() => {
        if (cancelled || !mapEl.current) return;
        const g = window.google;
        const map = new g.maps.Map(mapEl.current, {
          center: { lat: 20, lng: 0 },
          zoom: 2,
          mapTypeId: mapType,
          tilt: 45,
          disableDefaultUI: true,
          zoomControl: false,
          gestureHandling: "greedy",
          backgroundColor: "#000814",
          styles: [],
        });
        mapRef.current = map;
        setReady(true);

        map.addListener("click", (e: any) => {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          updatePin({ lat, lng, label: "Pinned Location" });
        });

        if (pin) drawMarker(pin);
      })
      .catch((err) => setError(err.message || "Maps failed to load"));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mapRef.current) mapRef.current.setMapTypeId(mapType);
  }, [mapType]);

  const drawMarker = (p: Pin) => {
    const g = window.google;
    if (!g || !mapRef.current) return;
    if (markerRef.current) markerRef.current.setMap(null);
    markerRef.current = new g.maps.Marker({
      position: { lat: p.lat, lng: p.lng },
      map: mapRef.current,
      title: p.label || "Pin",
      animation: g.maps.Animation.DROP,
    });
  };

  const updatePin = (p: Pin | null) => {
    setPin(p);
    onPinChange?.(p);
    if (p) drawMarker(p);
    else if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude, label: "My Location" };
        updatePin(p);
        mapRef.current?.panTo({ lat: p.lat, lng: p.lng });
        mapRef.current?.setZoom(8);
      },
      () => {
        const p = { lat: 37.7749, lng: -122.4194, label: "My Location (default)" };
        updatePin(p);
        mapRef.current?.panTo({ lat: p.lat, lng: p.lng });
        mapRef.current?.setZoom(8);
      }
    );
  };

  const zoom = (d: number) => {
    if (!mapRef.current) return;
    mapRef.current.setZoom((mapRef.current.getZoom() || 2) + d);
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border border-border ${className}`} style={{ height: size }}>
      <div ref={mapEl} className="absolute inset-0" />

      {!ready && !error && (
        <div className="absolute inset-0 grid place-items-center bg-background/80 text-xs text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Loading realistic globe…
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 grid place-items-center bg-background/80 p-4 text-center text-xs text-danger">
          {error}
        </div>
      )}

      {/* Map type selector */}
      <div className="absolute left-3 top-3 flex gap-1 rounded-md border border-border bg-background/70 p-1 backdrop-blur">
        {(["hybrid", "satellite", "terrain"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setMapType(t)}
            className={`rounded px-2 py-1 text-[10px] uppercase tracking-widest ${
              mapType === t ? "bg-primary text-background" : "text-muted-foreground hover:text-foreground"
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
          onClick={() => zoom(1)}
          className="grid h-8 w-8 place-items-center rounded-md border border-border bg-background/70 text-foreground backdrop-blur hover:bg-primary/10"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => zoom(-1)}
          className="grid h-8 w-8 place-items-center rounded-md border border-border bg-background/70 text-foreground backdrop-blur hover:bg-primary/10"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        {pin && (
          <button
            onClick={() => updatePin(null)}
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
