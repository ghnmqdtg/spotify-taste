import { create } from "zustand";

export type SortColumn =
  | "addedAt"
  | "name"
  | "artistNames"
  | "albumName"
  | "releaseDate"
  | "durationMs";

export type SortDirection = "asc" | "desc";

export interface Filters {
  artists: string[];
  albums: string[];
  dateRange: { from: string | null; to: string | null };
  durationRange: { min: number | null; max: number | null };
  explicit: boolean | null;
}

const DEFAULT_FILTERS: Filters = {
  artists: [],
  albums: [],
  dateRange: { from: null, to: null },
  durationRange: { min: null, max: null },
  explicit: null,
};

interface LibraryState {
  searchQuery: string;
  sortColumn: SortColumn;
  sortDirection: SortDirection;
  filters: Filters;
  selectedUris: Set<string>;

  setSearchQuery: (query: string) => void;
  setSort: (column: SortColumn) => void;
  setFilters: (filters: Partial<Filters>) => void;
  clearFilters: () => void;
  toggleSelection: (uri: string) => void;
  selectAll: (uris: string[]) => void;
  deselectAll: () => void;
  isSelected: (uri: string) => boolean;
}

export const useLibraryStore = create<LibraryState>((set, get) => ({
  searchQuery: "",
  sortColumn: "addedAt",
  sortDirection: "desc",
  filters: { ...DEFAULT_FILTERS },
  selectedUris: new Set(),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setSort: (column) =>
    set((state) => ({
      sortColumn: column,
      sortDirection:
        state.sortColumn === column
          ? state.sortDirection === "asc"
            ? "desc"
            : "asc"
          : "desc",
    })),

  setFilters: (partial) =>
    set((state) => ({
      filters: { ...state.filters, ...partial },
    })),

  clearFilters: () =>
    set({ filters: { ...DEFAULT_FILTERS }, searchQuery: "" }),

  toggleSelection: (uri) =>
    set((state) => {
      const next = new Set(state.selectedUris);
      if (next.has(uri)) {
        next.delete(uri);
      } else {
        next.add(uri);
      }
      return { selectedUris: next };
    }),

  selectAll: (uris) => set({ selectedUris: new Set(uris) }),

  deselectAll: () => set({ selectedUris: new Set() }),

  isSelected: (uri) => get().selectedUris.has(uri),
}));
