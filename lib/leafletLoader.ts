// Loads Leaflet plus the markercluster plugin once, client-side only.
// leaflet.markercluster attaches itself to a global `L`, so Leaflet has to be
// exposed on window before the plugin module is evaluated.

let leafletPromise: Promise<any> | null = null;

export function loadLeaflet(): Promise<any> {
  if (!leafletPromise) {
    leafletPromise = (async () => {
      const mod: any = await import("leaflet");
      const L = mod.default ?? mod;
      (window as any).L = L;
      await import("leaflet.markercluster");
      return L;
    })();
  }
  return leafletPromise;
}
