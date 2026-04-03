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
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex w-[480px] flex-col items-center gap-8 rounded-2xl border border-border bg-card px-10 py-12 shadow-[var(--shadow-card)]">
        <span className="font-[family-name:var(--font-heading)] text-[32px] font-bold text-accent">
          +
        </span>
        <h1 className="font-[family-name:var(--font-heading)] text-4xl font-bold text-foreground">
          spotify taste
        </h1>
        <p className="font-[family-name:var(--font-accent)] text-base italic text-muted-foreground">
          Discover what your music says about you
        </p>
        <button
          onClick={initiateLogin}
          className="rounded-full bg-primary px-8 py-3 text-base font-semibold text-primary-foreground transition-opacity hover:opacity-90"
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
