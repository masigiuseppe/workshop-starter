# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`workshop-starter` is an Express + TypeScript REST API used as the evolving project across the four labs of "Workshop AI per Sviluppatori — Modulo 2". Some files contain intentional `TODO` scaffolding and lab instructions (in Italian) meant to be completed by the workshop participant. Treat existing lab comments as part of the exercise, not as code to be cleaned up unless asked.

## Commands

```bash
npm run dev      # tsx watch on http://localhost:3000 (transpile-only, ignores type errors)
npm run build    # tsc → dist/  (fails on type errors)
npm start        # run the compiled build from dist/
npm test         # run all Jest tests

npx jest src/routes/__tests__/health.test.ts   # run a single test file
npx jest -t "GET /api/products"                 # run tests matching a name
```

Note the asymmetry: `npm run dev` uses tsx and starts even with TypeScript errors; `npm run build` does not. Jest is configured with ts-jest `diagnostics: false` (see `jest.config.js`), so **tests also run despite type errors** — type safety is only enforced by `npm run build`.

**`npm run build` currently fails** with `error TS5103: Invalid value for '--ignoreDeprecations'` — `tsconfig.json` sets `"ignoreDeprecations": "6.0"`, which the installed TypeScript (5.5) rejects. This is a config issue unrelated to any handler code; fix or remove that compiler option before relying on `build` to type-check.

## Architecture

Request flow: `index.ts` (server bootstrap, reads `PORT`, default 3000) → `app.ts` (`createApp()` builds the Express app and mounts routers) → `routes/*` (one router per resource) → `data/*` (in-memory stores) → `types/*` (shared models).

- **`createApp()` is the testable seam.** `index.ts` only listens; `app.ts` exports `createApp()` so tests can spin up the app without a live server. Standard test setup: `import { createApp } from '../../app'` + `supertest`.
- **In-memory stores reset per process, not per `createApp()`.** The stores in `data/products.ts` and `data/orders.ts` are module-level arrays shared across all `createApp()` calls in a process. Because `POST` mutates these arrays, tests that create data can leak state into later tests in the same file/run. Be aware of this when writing or debugging tests.
- **`id` generation** uses `Math.max(...) + 1` over the current array (`getNextId` / `getNextOrderId`).

## Conventions (from `.github/copilot-instructions.md`)

These are project rules; follow them when editing:

- `express.Router` is used **only** inside `src/routes/`. Never instantiate it in `app.ts` or elsewhere.
- All shared types live in `src/types/` (`Product`/`NewProduct`, `Order`/`NewOrder`). Never redefine them inline.
- No `any` — use `unknown`, `Partial<T>`, or a precise type. Strict mode is on.
- Handlers are `async` and always **explicitly `return`** their responses (`return res.status(400).json(...)`); never fall through.
- camelCase variables, kebab-case file names.
- No `console.log` in handlers; `console.error` only inside `middleware/errorHandler.ts`.
- Validation is **manual `typeof` guards**. Zod is installed but not adopted — don't introduce it unless asked.
- Don't add dependencies (or DB/ORM/external HTTP calls) without an explicit instruction; update both `package.json` and `package-lock.json` if you do.

## API surface

All routes are prefixed `/api`. `GET /api/health` → `{ status, timestamp }`. `products` and `orders` each expose `GET /` (paginated via `page`/`limit` query params, default 1/10, 400 if < 1) and `POST /` (201 on success, 400 `{ error, details }` on validation failure). See the route files for exact validation rules.

Both `GET` endpoints return a **plain array** (paginated slice), not a wrapped `{ data, total, page, limit }` object. The README and `.github/copilot-instructions.md` now match the code; the route files remain the source of truth if they drift again.

## Note on the "intentional bug"

The README and lab comments reference an intentional TypeScript bug in `src/middleware/errorHandler.ts` (accessing `err.status` on `Error`). It has **already been fixed** — the file now declares an `AppError extends Error` interface with an optional `status`. The README's note that the build fails "until the bug is corrected" is stale; `build` does still fail, but only because of the unrelated `tsconfig.json` issue noted above.
