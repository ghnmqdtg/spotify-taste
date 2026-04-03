const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
const MAX_CONCURRENCY = 5;

type GetAccessToken = () => Promise<string>;
type OnAuthFailure = () => void;

let getAccessTokenFn: GetAccessToken = () => {
  throw new Error("spotifyFetch not initialized — call initSpotifyClient first");
};
let onAuthFailureFn: OnAuthFailure = () => {};

export function initSpotifyClient(params: {
  getAccessToken: GetAccessToken;
  onAuthFailure?: OnAuthFailure;
}) {
  getAccessTokenFn = params.getAccessToken;
  onAuthFailureFn = params.onAuthFailure ?? (() => {});
}

// Simple concurrency limiter
let activeCount = 0;
const queue: Array<() => void> = [];

function acquireSlot(): Promise<void> {
  if (activeCount < MAX_CONCURRENCY) {
    activeCount++;
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    queue.push(() => {
      activeCount++;
      resolve();
    });
  });
}

function releaseSlot() {
  activeCount--;
  const next = queue.shift();
  if (next) next();
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function spotifyFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  await acquireSlot();
  try {
    return await doFetch<T>(endpoint, options, true);
  } finally {
    releaseSlot();
  }
}

async function doFetch<T>(
  endpoint: string,
  options: RequestInit,
  allowRetry: boolean
): Promise<T> {
  const token = await getAccessTokenFn();
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${SPOTIFY_API_BASE}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  // Rate limited — wait and retry
  if (response.status === 429) {
    const retryAfter = parseInt(response.headers.get("Retry-After") ?? "1", 10);
    await sleep(retryAfter * 1000);
    return doFetch<T>(endpoint, options, allowRetry);
  }

  // Unauthorized — refresh token and retry once
  if (response.status === 401 && allowRetry) {
    try {
      return await doFetch<T>(endpoint, options, false);
    } catch {
      onAuthFailureFn();
      throw new Error("Authentication failed");
    }
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Spotify API error: ${response.status} ${response.statusText} — ${errorText}`
    );
  }

  // Some endpoints return 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}
