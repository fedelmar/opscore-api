# CLAUDE.md — opscore-api

> Context for Claude and AI agents working in this repository.

---

## What is this project

`opscore-api` is the backend of OpsCore: a production and stock management
system for a cold-chain factory. It exposes an API built with tRPC on
Node.js, connected to PostgreSQL via Prisma.

This repo is part of a two-repository system:
- `fedelmar/opscore-api` — this repo (backend)
- `fedelmar/opscore-ui` — frontend (Next.js 16.2.3)

---

## Stack

- **Runtime:** Node.js + TypeScript
- **API:** tRPC (standalone server, not coupled to Next.js)
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Validation:** Zod (schemas shared with the frontend via inferred tRPC types)
- **HTTP Server:** Express as adapter

---

## Folder structure

```
src/
├── index.ts          # Entry point — starts the Express server
├── trpc.ts           # tRPC instance and base context definition
├── router.ts         # Root router that merges all sub-routers
├── routers/          # One file per domain
│   ├── health.ts
│   ├── auth.ts
│   ├── materials.ts
│   ├── products.ts
│   ├── orders.ts
│   └── stock.ts
├── prisma/
│   └── client.ts     # PrismaClient singleton
└── middleware/
    └── auth.ts       # JWT authentication middleware
prisma/
└── schema.prisma     # Database schema
```

---

## Business domain

Management system for a cold-chain factory. Key concepts:

- **Production order:** central entity of the system. Has states
  (pending → in progress → completed).
- **Countable inputs:** automatically deducted from stock when an order
  is completed, based on the product recipe (BOM).
- **Non-countable inputs:** tape, markers, general-use materials.
  Managed by periodic manual review, not automatic deduction.
- **Traceability:** every action is recorded in `audit_log` with
  user, timestamp, and order reference.
- **Roles:** `operator`, `supervisor`, `admin`.

---

## Code conventions

- Prefer arrow functions over `function` declarations for all new functions.
- All tRPC inputs must be validated with Zod. No exceptions.
- Never instantiate `PrismaClient` directly — use the singleton in
  `src/prisma/client.ts`.
- Routers go in `src/routers/`, one per business domain.
- Business errors are thrown with `TRPCError` using the appropriate code
  (`NOT_FOUND`, `BAD_REQUEST`, `FORBIDDEN`, etc.).
- Any DB queries that affect stock must run inside a Prisma transaction
  (`prisma.$transaction`).

---

## Environment variables

See `.env.example` in the root. Required variables:

```
DATABASE_URL=    # PostgreSQL connection string
PORT=            # Server port (default: 3001)
JWT_SECRET=      # Secret for signing JWT tokens
NODE_ENV=        # development | staging | production
```

---

## Scripts

```bash
npm run dev               # Dev server with hot reload (nodemon + ts-node)
npm run build             # Compile TypeScript to dist/
npm run start             # Run compiled build
npm run prisma:generate   # Regenerate Prisma client
npm run prisma:push       # Apply schema to DB (dev only)
npm run prisma:migrate    # Create and apply a migration (staging/prod)
npm run prisma:studio     # Open Prisma Studio in the browser
```

---

## Infrastructure

- **Staging and production:** Railway
- **Database:** PostgreSQL managed on Railway with automatic backups
- **Branch → environment:** `staging` → staging, `main` → production
- **Estimated cost:** USD 15–25/month (API + DB)

---

## What NOT to do

- Do not use `any` in TypeScript. If it can't be typed, use `unknown`
  with explicit narrowing.
- Do not put business logic directly in routers — extract it to
  separate functions or services as it grows.
- Never commit `.env` under any circumstances.
- Never update stock directly with `update` — always create an associated
  `StockMovement` to preserve the full history.
