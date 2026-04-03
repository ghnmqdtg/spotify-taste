"use client";

import { generatePKCE, buildAuthorizationUrl } from "@spotify-taste/spotify-client";
import { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI } from "@/lib/config";

async function initiateLogin() {
  const { codeVerifier, codeChallenge } = await generatePKCE();
  const state = crypto.randomUUID();

  sessionStorage.setItem("pkce_code_verifier", codeVerifier);
  sessionStorage.setItem("pkce_state", state);

  const authUrl = buildAuthorizationUrl({
    clientId: SPOTIFY_CLIENT_ID,
    redirectUri: SPOTIFY_REDIRECT_URI,
    codeChallenge,
    state,
  });

  window.location.href = authUrl;
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">Spotify Taste</h1>
      <p className="text-muted">
        Browse, manage, and organize your liked songs library.
      </p>
      <button
        onClick={initiateLogin}
        className="rounded-full bg-primary px-8 py-3 text-lg font-semibold text-primary-foreground transition-opacity hover:opacity-90"
      >
        Login with Spotify
      </button>
    </main>
  );
}
