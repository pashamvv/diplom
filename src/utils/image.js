export const BACKEND_URL = "http://127.0.0.1:8000";
export const FALLBACK_IMG = "/no-image.png";

export function getImageSrc(image) {
  if (!image || typeof image !== "string") return FALLBACK_IMG;

  const t = image.trim();
  if (!t) return FALLBACK_IMG;

  if (t.startsWith("http://") || t.startsWith("https://")) return t;

  if (t.startsWith("/")) {
    return `${BACKEND_URL}${t}`;
  }

  return `${BACKEND_URL}/${t}`;
}