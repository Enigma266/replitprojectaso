# ASO1940 — نظام إدارة الجمعيات المدنية

## Overview

Arabic RTL management system for Algerian civil associations (NGOs, charities, sports clubs, etc.), built for municipal staff. Full-stack pnpm monorepo.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Frontend**: React + Vite + Tailwind CSS (artifact: `aso1940`, path: `/`)
- **API framework**: Express 5 (artifact: `api-server`, path: `/api`)
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec in `lib/api-spec/openapi.yaml`)
- **React Query**: Auto-generated hooks in `lib/api-client-react`
- **Build**: esbuild (CJS bundle)
- **UI font**: Cairo (Google Fonts) — Arabic RTL

## Architecture

```
artifacts/
  api-server/         Express API (port 8080, path /api)
  aso1940/            React+Vite frontend (port 23272, path /)
lib/
  api-spec/           OpenAPI spec + Orval codegen config
  api-client-react/   Auto-generated React Query hooks
  api-zod/            Auto-generated Zod validation schemas
  db/                 Drizzle ORM schema + db client
```

## Database Schema

- **associations** — core entity (name, type, status, wilaya, tenure, etc.)
- **members** — association members (position, membershipType, status)
- **receipts** — document receipts per association

## Key Business Rules

- Association types: 30+ types (charity, sports, cultural, educational, etc.)
- Tenure: 4 years standard; sports clubs get 3 years (+1yr optional extension)
- Status values: establishment, renewal, suspension, warning, dissolution, active, inactive
- Member positions: president, vice_president, secretary, treasurer, member, etc.

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks + Zod schemas from OpenAPI spec
  - After codegen, `lib/api-zod/src/index.ts` must only have `export * from "./generated/api"` (orval bug workaround)
- `pnpm --filter @workspace/db run push` — push DB schema changes to PostgreSQL (dev only)

## Pages

- `/` — Dashboard: stats cards + charts (by type, by status, monthly, expiring)
- `/associations` — Searchable/filterable associations list
- `/associations/new` — Create association form
- `/associations/:id` — Detail: members tab, receipts tab, tenure card + renew button
- `/associations/:id/edit` — Edit association form
- `/associations/:id/members/new` — Add member form
- `/associations/:id/members/:memberId/edit` — Edit member form
