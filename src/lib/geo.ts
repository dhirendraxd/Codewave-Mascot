export interface GeoCapture {
  lat: number;
  lng: number;
  city: string | null;
}

export async function tryCaptureGeolocation(timeoutMs = 5000): Promise<GeoCapture | null> {
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
  if (!coords) return null;
  let city: string | null = null;
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}&zoom=10&addressdetails=1`,
      { headers: { Accept: "application/json" } },
    );
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
  return { lat: coords.latitude, lng: coords.longitude, city };
}