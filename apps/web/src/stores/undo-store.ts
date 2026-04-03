import { create } from "zustand";

export type UndoOperationType =
  | "unlike"
  | "add-to-playlist"
  | "move-to-playlist";

export interface UndoableOperation {
  type: UndoOperationType;
  trackUris: string[];
  playlistId?: string;
  timestamp: number;
}

interface UndoState {
  lastOperation: UndoableOperation | null;
  timeoutId: ReturnType<typeof setTimeout> | null;
  setOperation: (op: UndoableOperation) => void;
  clearOperation: () => void;
}

const UNDO_TIMEOUT_MS = 30_000;

export const useUndoStore = create<UndoState>((set, get) => ({
  lastOperation: null,
  timeoutId: null,

  setOperation: (op) => {
    const { timeoutId } = get();
    if (timeoutId) clearTimeout(timeoutId);

    const newTimeoutId = setTimeout(() => {
      set({ lastOperation: null, timeoutId: null });
    }, UNDO_TIMEOUT_MS);

    set({ lastOperation: op, timeoutId: newTimeoutId });
  },

  clearOperation: () => {
    const { timeoutId } = get();
    if (timeoutId) clearTimeout(timeoutId);
    set({ lastOperation: null, timeoutId: null });
  },
}));
