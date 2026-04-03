import type { LikedTrack } from "@spotify-taste/spotify-client";
import type { ArtistGenreRecord } from "@/lib/db";

export interface TrackGenres {
  uri: string;
  primaryGenre: string;
  genres: string[];
}

/**
 * Assign macro-genre categories to each track based on its artists' normalized genres.
 * First artist's primary genre takes precedence.
 */
export function assignTrackGenres(
  tracks: LikedTrack[],
  artistGenreRecords: ArtistGenreRecord[],
  genreMapping: Map<string, string>
): TrackGenres[] {
  const artistGenreMap = new Map(
    artistGenreRecords.map((r) => [r.artistId, r.genres])
  );

  return tracks.map((track) => {
    const macroGenres: string[] = [];

    for (const artistId of track.artistIds ?? []) {
      const microGenres = artistGenreMap.get(artistId) ?? [];
      for (const micro of microGenres) {
        const macro = genreMapping.get(micro) ?? "Other";
        if (!macroGenres.includes(macro)) {
          macroGenres.push(macro);
        }
      }
    }

    return {
      uri: track.uri,
      primaryGenre: macroGenres[0] ?? "Unknown",
      genres: macroGenres.length > 0 ? macroGenres : ["Unknown"],
    };
  });
}
