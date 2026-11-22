import { API_URL } from "./api";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

function getImageUrl(value: unknown): string | null {
  if (!isRecord(value) || value.success !== true || !isRecord(value.data)) return null;
  const candidates = [value.data.display_url, value.data.url];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && /^https?:\/\//i.test(candidate)) return candidate;
  }
  if (isRecord(value.data.image) && typeof value.data.image.url === "string") {
    return value.data.image.url;
  }
  return null;
}

function getErrorMessage(value: unknown): string | undefined {
  if (!isRecord(value) || !isRecord(value.error)) return undefined;
  return typeof value.error.message === "string" ? value.error.message : undefined;
}

export async function uploadImageToImgBB(file: File): Promise<string> {
  const apiKey =
    process.env.NEXT_PUBLIC_IMGBB_API_KEY ||
    "d3e6d6b07fa72c90b09b768b3c60e842";
  if (!apiKey) {
    throw new Error("Image upload is not configured. Add NEXT_PUBLIC_IMGBB_API_KEY to the client environment.");
  }
  if (!file.type.startsWith("image/")) {
    throw new Error("Choose an image file to upload.");
  }
  if (file.size > 32 * 1024 * 1024) {
    throw new Error("Choose an image smaller than 32 MB.");
  }

  const body = new FormData();
  body.append("image", file);

  let response: Response;
  try {
    response = await fetch(`https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      body,
    });
  } catch {
    throw new Error("Could not reach image hosting. Check your connection and try again.");
  }

  const result: unknown = await response.json().catch(() => null);
  const imageUrl = getImageUrl(result);
  if (!response.ok || !imageUrl) {
    throw new Error(getErrorMessage(result) || "Image upload failed. Please try again.");
  }

  return imageUrl;
}

export async function resolveEquipmentImageUrl(url: string): Promise<string> {
  const trimmed = url.trim();
  if (!/^https?:\/\/(?:ibb\.co(?:\.com)?|www\.ibb\.co(?:\.com)?)\//i.test(trimmed)) {
    return trimmed;
  }
  const response = await fetch(`${API_URL}/images/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: trimmed }),
  }).catch(() => null);
  if (!response?.ok) return trimmed;
  const data = await response.json().catch(() => null);
  return isRecord(data) && typeof data.url === "string" ? data.url : trimmed;
}
