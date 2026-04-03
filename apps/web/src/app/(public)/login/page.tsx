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
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex w-full max-w-[480px] flex-col items-center gap-8 rounded-2xl bg-card/90 px-10 py-12 shadow-[var(--shadow-soft-lift)]">
        <span className="font-heading text-3xl font-bold text-primary">+</span>
        <h1 className="font-heading text-4xl font-bold">spotify taste</h1>
        <p className="font-caption italic text-muted-foreground">
          Discover what your music says about you
        </p>
        <button
          onClick={initiateLogin}
          className="rounded-md bg-primary px-8 py-3 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Connect with Spotify
        </button>
        <p className="max-w-[320px] text-center text-xs text-muted">
          Your data stays on your device. We never store your listening history.
        </p>
      </div>
    </main>
  );
}
