import { supabase } from "@/lib/supabase";

const BUCKET = "incident-photos";
// Photos are private; the page shows them through short-lived signed URLs.
const SIGNED_URL_TTL_SECONDS = 60 * 60;
const REFRESH_MARGIN_MS = 5 * 60 * 1000;

export async function uploadIncidentPhotos(incidentId: string, files: File[]) {
  const urls: string[] = [];
  for (const [index, file] of files.slice(0, 2).entries()) {
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${incidentId}/${Date.now()}-${index}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, { upsert: false, contentType: file.type || undefined });
    if (error) throw error;
    // Stored in the same format as earlier rows; the path is read back out of it.
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

export function storagePathFromIncidentPhoto(url: string) {
  const input = String(url ?? "").trim();
  if (!input) return null;
  const markers = [
    "/storage/v1/object/public/incident-photos/",
    "/storage/v1/object/sign/incident-photos/",
    "/storage/v1/object/authenticated/incident-photos/",
    "/storage/v1/render/image/public/incident-photos/",
    "/storage/v1/render/image/authenticated/incident-photos/",
  ];
  for (const marker of markers) {
    const i = input.indexOf(marker);
    if (i >= 0) {
      const encoded = input.slice(i + marker.length).split("?")[0];
      try {
        return decodeURIComponent(encoded);
      } catch {
        return encoded;
      }
    }
  }
  if (!/^https?:\/\//i.test(input)) {
    const path = input.startsWith("incident-photos/") ? input.slice("incident-photos/".length) : input;
    return path.replace(/^\/+/, "").split("?")[0] || null;
  }
  return null;
}

const signedCache = new Map<string, { url: string; expiresAt: number }>();

// Returns a displayable URL, or null when the value is not a SIRA photo.
export async function resolveIncidentPhotoUrl(url: string): Promise<string | null> {
  const path = storagePathFromIncidentPhoto(url);
  if (!path) return null;
  const cached = signedCache.get(path);
  if (cached && cached.expiresAt > Date.now()) return cached.url;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL_SECONDS);
  if (error || !data?.signedUrl) return null;
  signedCache.set(path, { url: data.signedUrl, expiresAt: Date.now() + SIGNED_URL_TTL_SECONDS * 1000 - REFRESH_MARGIN_MS });
  return data.signedUrl;
}
