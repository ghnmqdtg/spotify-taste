import { db, type GenreMapping } from "@/lib/db";
import type { LLMProvider } from "@spotify-taste/llm-provider";
import { parseLLMJson } from "@spotify-taste/llm-provider";

const GENRE_NORMALIZATION_PROMPT = `You are a music genre classifier. Given a list of Spotify micro-genres, map each one to exactly ONE of these macro categories:

Rock, Pop, Hip-Hop, R&B, Electronic, Jazz, Classical, Country, Folk, Metal, Punk, Blues, Soul, Reggae, Latin, World, Ambient, Indie, Alternative, Other

Respond with a JSON object mapping each input genre to its macro category.
Example: {"indie rock": "Indie", "trap": "Hip-Hop", "baroque": "Classical"}

Input genres:`;

/**
 * Normalize Spotify micro-genres to macro categories using LLM.
 * Only sends unmapped genres; caches results in IndexedDB.
 */
export async function normalizeGenres(
  microGenres: string[],
  provider: LLMProvider
): Promise<Map<string, string>> {
  // Check cache for existing mappings
  const cached = await db.genreMappings.toArray();
  const cachedMap = new Map(cached.map((m) => [m.microGenre, m.macroCategory]));

  const unmapped = microGenres.filter((g) => !cachedMap.has(g));

  if (unmapped.length === 0) {
    return cachedMap;
  }

  // Send unmapped genres to LLM
  const genreList = unmapped.join(", ");
  const response = await provider.complete([
    {
      role: "user",
      content: `${GENRE_NORMALIZATION_PROMPT}\n${genreList}`,
    },
  ], { temperature: 0.3 });

  const mapping = parseLLMJson<Record<string, string>>(response);

  // Store new mappings
  const newMappings: GenreMapping[] = Object.entries(mapping).map(
    ([microGenre, macroCategory]) => ({ microGenre, macroCategory })
  );
  await db.genreMappings.bulkPut(newMappings);

  // Merge with cached
  for (const [micro, macro] of Object.entries(mapping)) {
    cachedMap.set(micro, macro);
  }

  return cachedMap;
}

/**
 * Get genre distribution without LLM — just raw Spotify micro-genres grouped by frequency.
 */
export function getRawGenreDistribution(
  artistGenres: Map<string, string[]>
): Map<string, number> {
  const counts = new Map<string, number>();
  for (const genres of artistGenres.values()) {
    for (const genre of genres) {
      counts.set(genre, (counts.get(genre) ?? 0) + 1);
    }
  }
  return counts;
}
