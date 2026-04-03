export const SPOTIFY_CLIENT_ID =
  process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID ?? "";

export const SPOTIFY_REDIRECT_URI =
  process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI ??
  (typeof window !== "undefined"
    ? `${window.location.origin}/callback`
    : "http://localhost:3000/callback");
