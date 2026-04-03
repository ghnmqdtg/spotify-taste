# CLAUDE.md — spotify-taste

## Project Overview

A Spotify music taste analyzer. Pnpm monorepo using Turborepo, Next.js 15, React 19, Tailwind CSS v4, and TypeScript.

## Monorepo Structure

- `apps/web` — Next.js 15 app (App Router). Main UI with Spotify OAuth, dashboard, stats, settings
- `packages/spotify-client` — Spotify Web API client
- `packages/llm-provider` — LLM provider abstraction for taste analysis
- `packages/ui` — Shared component library (CVA + tailwind-merge)

## Key Tech

- **Package manager:** pnpm 10 (`pnpm install`, `pnpm run`)
- **Build orchestration:** Turborepo (`turbo run build/dev/lint/typecheck`)
- **State:** Zustand stores (`apps/web/src/stores/`)
- **Data fetching:** TanStack React Query
- **Local DB:** Dexie (IndexedDB) at `apps/web/src/lib/db/`
- **Styling:** Tailwind CSS v4 with Heritage Warmth design system

## Commands

```bash
pnpm install          # install dependencies
turbo run dev         # start all packages in dev mode
turbo run build       # production build
turbo run lint        # eslint across all packages
turbo run typecheck   # tsc --noEmit across all packages
```

## App Routes (apps/web)

- `(public)/login` — Spotify OAuth login
- `(auth)/dashboard` — Main dashboard with song table
- `(auth)/stats` — Taste profile and insights
- `(auth)/settings` — LLM config and preferences
- `api/auth` — Auth API routes
- `callback` — Spotify OAuth callback

## Conventions

- Commit format: `{Type}: {Description}` (e.g., `Feat:`, `Fix:`, `Chore:`, `Refactor:`)
- Workspace packages are referenced as `@spotify-taste/*` (e.g., `@spotify-taste/ui`)
- Shared UI components go in `packages/ui`, app-specific components in `apps/web/src/components/`
- Env vars: `NEXT_PUBLIC_SPOTIFY_CLIENT_ID`, `NEXT_PUBLIC_SPOTIFY_REDIRECT_URI`
- OAuth redirect must use `127.0.0.1`, not `localhost`

## Design System

The app uses a "Heritage Warmth" palette. Reference the Pencil design file (`design.pen`) via Pencil MCP tools for visual specs. Do not read `.pen` files with the Read tool.

## Workflow Preferences

- **Visual verification:** After implementing UI changes, start the dev server and use Chrome MCP to visually verify the result in the browser. Don't just review code -- confirm it renders correctly.
- **No emoji:** Do not use emoji in commit messages, PR descriptions, documentation, or any text output.
- **Plans are not code:** `plans/` and `openspec/changes/` are gitignored working documents. Never commit them.
- **Spotify OAuth:** The Spotify Developer App ("Spotify-Taste") uses Web API only. Local dev must use `http://127.0.0.1:3000` -- Spotify rejects `http://localhost` redirect URIs. The `.env.local` redirect URI must match what's registered in the Spotify dashboard.
