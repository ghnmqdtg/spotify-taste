"use client";

import { useQuery } from "@tanstack/react-query";
import { spotifyFetch, type SpotifyUser } from "@spotify-taste/spotify-client";

export function useCurrentUser() {
  return useQuery<SpotifyUser>({
    queryKey: ["currentUser"],
    queryFn: () => spotifyFetch<SpotifyUser>("/me"),
    staleTime: 30 * 60 * 1000,
  });
}
