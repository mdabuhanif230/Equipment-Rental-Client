const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

function getImageUrl(value: unknown): string | null {
  if (!isRecord(value) || value.success !== true || !isRecord(value.data)) return null;
  return typeof value.data.url === "string" ? value.data.url : null;
}

function getErrorMessage(value: unknown): string | undefined {
  if (!isRecord(value) || !isRecord(value.error)) return undefined;
  return typeof value.error.message === "string" ? value.error.message : undefined;
}

export async function uploadImageToImgBB(file: File): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;
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
