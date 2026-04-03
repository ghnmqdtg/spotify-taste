"use client";

import { useLibraryStore } from "@/stores/library-store";

export function SearchBar() {
  const { searchQuery, setSearchQuery } = useLibraryStore();

  return (
    <input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search tracks, artists, albums..."
      className="w-80 rounded-md border border-border bg-card px-4 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-accent"
    />
  );
}
