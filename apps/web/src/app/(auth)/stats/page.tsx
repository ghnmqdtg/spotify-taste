"use client";

import { useLikedTracks } from "@/hooks/use-sync";
import { LibrarySummary } from "@/components/stats/library-summary";
import { TopArtistsChart } from "@/components/stats/top-artists-chart";
import { TimelineChart } from "@/components/stats/timeline-chart";
import { DecadeChart } from "@/components/stats/decade-chart";

export default function StatsPage() {
  const { tracks } = useLikedTracks();

  if (tracks.length === 0) {
    return (
      <main className="p-6">
        <h1 className="mb-4 text-2xl font-bold">Library Statistics</h1>
        <p className="text-muted">
          No songs synced yet. Visit the dashboard to sync your library.
        </p>
      </main>
    );
  }

  return (
    <main className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Library Statistics</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <LibrarySummary tracks={tracks} />
        <TopArtistsChart tracks={tracks} />
        <TimelineChart tracks={tracks} />
        <DecadeChart tracks={tracks} />
      </div>
    </main>
  );
}
