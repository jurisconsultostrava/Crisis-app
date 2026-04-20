# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM (available but not used in crisis-dashboard — uses JSON file store)
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Artifacts

### Krizový Dashboard (`/`)
- **Frontend**: `artifacts/crisis-dashboard/` — React + Vite, dark mode, Czech language
- **Backend**: `artifacts/api-server/` — Express 5 API server

### Features
- IMAP sync: connects to configured email accounts via imapflow, downloads last 15 messages
- AI triage: each email is analyzed by gpt-4o-mini → returns priority (1-10), category (Finance/Klient/Dodavatel/Operativa), CZ summary, CZ draft reply
- Multiple email account management via `/accounts` Settings page (stored in `artifacts/api-server/data/accounts.json`)
- Task cards sorted by priority with "Kopírovat odpověď" and "Vyřízeno" buttons
- "Kolik úkolů hoří" indicator (priority 8+ = burning)

### Data Storage
- Email accounts: `artifacts/api-server/data/accounts.json` (includes encrypted passwords in plaintext — production should use proper encryption)
- Tasks: `artifacts/api-server/data/tasks.json`
- Deduplication by IMAP messageId to avoid re-processing same emails

### Key Backend Files
- `artifacts/api-server/src/lib/store.ts` — JSON file-based data store
- `artifacts/api-server/src/lib/imap.ts` — IMAP connection via imapflow
- `artifacts/api-server/src/lib/ai.ts` — OpenAI gpt-4o-mini analysis
- `artifacts/api-server/src/routes/accounts.ts` — account CRUD
- `artifacts/api-server/src/routes/tasks.ts` — task management + stats
- `artifacts/api-server/src/routes/sync.ts` — IMAP sync + AI analysis pipeline

### Environment Variables
- `OPENAI_API_KEY` — required for AI analysis (set as Replit secret)
- Email credentials are stored in the app's JSON file, not in env vars

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
