export interface GeoCapture {
  lat: number;
  lng: number;
  city: string | null;
}

let cachedGeo: { value: GeoCapture | null; at: number } | null = null;
const GEO_CACHE_MS = 10 * 60 * 1000; // 10 min

export async function tryCaptureGeolocation(timeoutMs = 1500): Promise<GeoCapture | null> {
  // Reuse a recent fix to avoid blocking saves on repeat captures.
  if (cachedGeo && Date.now() - cachedGeo.at < GEO_CACHE_MS) {
    return cachedGeo.value;
  }
  if (typeof navigator === "undefined" || !navigator.geolocation) return null;
  const coords = await new Promise<GeolocationCoordinates | null>((resolve) => {
    const timer = setTimeout(() => resolve(null), timeoutMs);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(timer);
        resolve(pos.coords);
      },
      () => {
        clearTimeout(timer);
        resolve(null);
      },
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 5 * 60 * 1000 },
    );
  });
  if (!coords) {
    cachedGeo = { value: null, at: Date.now() };
    return null;
  }
  let city: string | null = null;
  try {
    // Cap the reverse-geocode request — Nominatim can be slow.
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 1500);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}&zoom=10&addressdetails=1`,
      { headers: { Accept: "application/json" }, signal: ctrl.signal },
    );
    clearTimeout(t);
    if (res.ok) {
      const data = await res.json();
      city =
        data?.address?.city ??
        data?.address?.town ??
        data?.address?.village ??
        data?.address?.county ??
        null;
    }
  } catch {
    /* noop */
  }
  const value: GeoCapture = { lat: coords.latitude, lng: coords.longitude, city };
  cachedGeo = { value, at: Date.now() };
  return value;
}