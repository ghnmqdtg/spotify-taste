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
      className="w-full max-w-md rounded-md border border-input bg-secondary px-4 py-2 text-sm text-foreground placeholder:text-muted outline-none focus:border-primary"
    />
  );
}
