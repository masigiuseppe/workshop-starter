# Copilot Instructions — workshop-starter

## Project context

Express + TypeScript REST API for the AI for Developers Workshop (Module 2).
In-memory store — no database, no ORM. The stores are module-level arrays in `src/data/`; they live for the lifetime of the Node process and are **shared across every `createApp()` call**. `POST` requests mutate them, so data created in one test can leak into later tests in the same run — isolate accordingly (see Testing conventions).

Architecture: `app.ts` bootstraps the Express app and mounts routes → `routes/` contains all handlers → `data/` holds the in-memory stores → `types/` owns all shared types.

## Stack

| Layer      | Choice                                          |
|------------|-------------------------------------------------|
| Runtime    | Node.js 18+                                     |
| Language   | TypeScript 5 (strict)                           |
| Framework  | Express 4                                       |
| Testing    | Jest + Supertest + ts-jest                      |
| Validation | Manual typeof guards — Zod is installed but not yet adopted |

## Architecture rules

- `express.Router` is only used inside `src/routes/`. Never instantiate it in `app.ts` or elsewhere.
- All types come from `src/types/` (`Product`/`NewProduct`, `Order`/`NewOrder`). Never redefine them inline.
- No `any` — use `unknown`, `Partial<T>`, or a precise type.
- All files must compile cleanly with `npm run build` before committing.
- Never add a dependency without updating `package.json` and `package-lock.json`.

## Code conventions

- All Express handlers are `async`, even if they don't currently `await` anything.
- Always use explicit `return` on responses: `return res.json(...)` / `return res.status(400).json(...)`. Never fall through.
- Variable names: camelCase. File names: kebab-case.
- No `console.log` in handlers. Use `console.error` only inside the global error handler (`src/middleware/errorHandler.ts`).

## API surface

### GET /api/health
```
200 { status: "ok", timestamp: string }   // ISO 8601
```

### GET /api/products
```
Query params: page (default 1), limit (default 10)
200 Product[]            // paginated slice, returned as a plain array
400 { error: string }    // if page < 1 or limit < 1
```

### POST /api/products
```
Body: { name: string, price: number, category?: string }
201 Product
400 { error: string, details?: Record<string, string> }
```

### GET /api/orders
```
Query params: page (default 1), limit (default 10)
200 Order[]              // paginated slice, returned as a plain array
400 { error: string }    // if page < 1 or limit < 1
```

### POST /api/orders
```
Body: { productId: number, quantity: number, status?: string }
201 Order
400 { error: string, details?: Record<string, string> }
```

## Validation rules

Validate each field with manual `typeof` guards. On any failure, return 400 with `{ error: "Validation failed", details }`.

```ts
// products
typeof name === 'string' && name.trim().length > 0
typeof price === 'number' && Number.isFinite(price)
category === undefined || typeof category === 'string'

// orders
typeof productId === 'number' && Number.isInteger(productId) && productId > 0
typeof quantity === 'number' && Number.isInteger(quantity) && quantity > 0
status === undefined || typeof status === 'string'
```

`details` is a per-field map describing what was expected:

```json
{ "error": "Validation failed", "details": { "price": "price must be a valid number" } }
```

## Testing conventions

- Test files live in `src/routes/__tests__/*.test.ts`.
- Standard import pattern:
  ```ts
  import request from 'supertest';
  import { createApp } from '../../app';
  ```
- Each `describe` block maps to one endpoint. Each `it` covers one case.
- `createApp()` does NOT reset the in-memory stores — they persist for the whole process. Tests that `POST` must not assume a clean store; assert on the records they create rather than on absolute totals, or otherwise account for the shared state.
- Cover both happy path and edge cases (invalid types, missing fields, boundary values for pagination).

## What NOT to generate

- No ORM, no database client, no external HTTP calls.
- No shared mutable state outside `src/data/`.
- No `express.Router` outside `src/routes/`.
- No inline type definitions duplicating `src/types/`.
- No `console.log` in request handlers.
- No new npm packages without an explicit instruction to add them.
