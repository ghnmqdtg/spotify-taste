"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { exchangeCodeForTokens } from "@spotify-taste/spotify-client";
import { SPOTIFY_CLIENT_ID, SPOTIFY_REDIRECT_URI } from "@/lib/config";
import { tokenStore } from "@/lib/token-store";

export default function CallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleCallback() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const state = params.get("state");
      const errorParam = params.get("error");

      if (errorParam) {
        setError(`Spotify authorization failed: ${errorParam}`);
        return;
      }

      const storedState = sessionStorage.getItem("pkce_state");
      if (state !== storedState) {
        setError("State mismatch — possible CSRF attack. Please try again.");
        return;
      }

      const codeVerifier = sessionStorage.getItem("pkce_code_verifier");
      if (!code || !codeVerifier) {
        setError("Missing authorization code or PKCE verifier. Please try again.");
        return;
      }

      try {
        const tokens = await exchangeCodeForTokens({
          clientId: SPOTIFY_CLIENT_ID,
          code,
          redirectUri: SPOTIFY_REDIRECT_URI,
          codeVerifier,
        });

        // Store access token in memory
        tokenStore.setAccessToken(tokens.accessToken, tokens.expiresIn);

        // Store refresh token via API route (HttpOnly cookie)
        await fetch("/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: tokens.refreshToken }),
        });

        // Clean up PKCE state
        sessionStorage.removeItem("pkce_code_verifier");
        sessionStorage.removeItem("pkce_state");

        router.replace("/dashboard");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Token exchange failed"
        );
      }
    }

    handleCallback();
  }, [router]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-destructive">{error}</p>
        <a href="/login" className="text-primary underline">
          Try again
        </a>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted">Completing login...</p>
    </div>
  );
}
