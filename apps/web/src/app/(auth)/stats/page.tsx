"use client";

import { useLikedTracks } from "@/hooks/use-sync";
import { LibrarySummary } from "@/components/stats/library-summary";
import { TopArtistsChart } from "@/components/stats/top-artists-chart";
import { TimelineChart } from "@/components/stats/timeline-chart";
import { DecadeChart } from "@/components/stats/decade-chart";
import { TasteProfileSection } from "@/components/stats/taste-profile-section";
import { InsightsSection } from "@/components/stats/insights-section";
import { ErrorBoundary } from "@/components/error-boundary";

export default function StatsPage() {
  const { tracks } = useLikedTracks();

  if (tracks.length === 0) {
    return (
      <main className="px-8 py-6">
        <h1 className="mb-4 font-heading text-3xl font-bold">Library Stats</h1>
        <p className="text-muted">
          No songs synced yet. Visit the dashboard to sync your library.
        </p>
      </main>
    );
  }

  return (
    <main className="px-8 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-3xl font-bold">Library Stats</h1>
        <span className="font-caption text-sm italic text-muted">Updated just now</span>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <LibrarySummary tracks={tracks} />
        <TopArtistsChart tracks={tracks} />
        <TimelineChart tracks={tracks} />
        <DecadeChart tracks={tracks} />
        <ErrorBoundary>
          <TasteProfileSection tracks={tracks} />
        </ErrorBoundary>
        <ErrorBoundary>
          <InsightsSection tracks={tracks} />
        </ErrorBoundary>
      </div>
    </main>
  );
}
