import { refreshAccessToken } from "@spotify-liked-songs-manager/spotify-client";
import { SPOTIFY_CLIENT_ID } from "./config";

class TokenStore {
  private accessToken: string | null = null;
  private expiresAt: number = 0;
  private refreshPromise: Promise<string> | null = null;

  setAccessToken(token: string, expiresIn: number) {
    this.accessToken = token;
    // Expire 60 seconds early to avoid edge-case 401s
    this.expiresAt = Date.now() + (expiresIn - 60) * 1000;
  }

  getAccessToken(): string | null {
    if (this.accessToken && Date.now() < this.expiresAt) {
      return this.accessToken;
    }
    return null;
  }

  async getValidAccessToken(): Promise<string> {
    const token = this.getAccessToken();
    if (token) return token;
    return this.refresh();
  }

  async refresh(): Promise<string> {
    // Single in-flight refresh promise pattern
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.doRefresh();
    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  private async doRefresh(): Promise<string> {
    const response = await fetch("/api/auth/refresh", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      this.clear();
      throw new Error("Session expired");
    }

    const { refreshToken } = await response.json();

    const result = await refreshAccessToken({
      clientId: SPOTIFY_CLIENT_ID,
      refreshToken,
    });

    this.setAccessToken(result.accessToken, result.expiresIn);

    // Update the refresh token cookie if it changed
    if (result.refreshToken !== refreshToken) {
      await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: result.refreshToken }),
      });
    }

    return result.accessToken;
  }

  clear() {
    this.accessToken = null;
    this.expiresAt = 0;
    this.refreshPromise = null;
  }

  isAuthenticated(): boolean {
    return this.accessToken !== null && Date.now() < this.expiresAt;
  }
}

export const tokenStore = new TokenStore();
