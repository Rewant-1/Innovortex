export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8000";

export async function fetchJson(path, init) {
  const url = `${BACKEND_URL}${path}`;
  const response = await fetch(url, init);

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = payload?.error ?? payload?.detail?.error ?? "Request failed";
    throw new Error(message);
  }

  return response.json();
}
