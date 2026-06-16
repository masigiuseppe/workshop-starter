# Copilot Instructions — workshop-starter

## Project context

Express + TypeScript REST API for the AI for Developers Workshop (Module 2).
In-memory store — no database, no ORM. The store resets on every `createApp()` call, which is intentional and required by the test design.

Architecture: `app.ts` bootstraps the Express app and mounts routes → `routes/` contains all handlers → `data/products.ts` holds the in-memory store → `types/product.ts` owns all shared types.

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
- All types come from `src/types/product.ts` (`Product`, `NewProduct`). Never redefine them inline.
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
200 { data: Product[], total: number, page: number, limit: number }
400 { error: string }   // if page < 1 or limit < 1
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
200 Order[]
400 { error: string }   // if page < 1 or limit < 1
```

### POST /api/orders
```
Body: { productId: number, quantity: number, status?: string }
201 Order
400 { error: string, details?: Record<string, string> }
```

## Validation rules

Apply these checks in order. Return 400 on the first failure with a descriptive error string.

```ts
// name
typeof name === 'string' && name.trim().length > 0

// price
typeof price === 'number' && Number.isFinite(price) && price >= 0

// category (optional)
category === undefined || typeof category === 'string'
```

`details` in the 400 response is optional but recommended for multi-field errors:

```json
{ "error": "Validation failed", "details": { "price": "must be a non-negative finite number" } }
```

## Testing conventions

- Test files live in `src/routes/__tests__/*.test.ts`.
- Standard import pattern:
  ```ts
  import request from 'supertest';
  import { createApp } from '../../app';
  ```
- Each `describe` block maps to one endpoint. Each `it` covers one case.
- Tests are fully isolated — call `createApp()` inside each test or in `beforeEach`. Never share app instances or store state across tests.
- Cover both happy path and edge cases (invalid types, missing fields, boundary values for pagination).

## What NOT to generate

- No ORM, no database client, no external HTTP calls.
- No shared mutable state outside `src/data/products.ts`.
- No `express.Router` outside `src/routes/`.
- No inline type definitions duplicating `src/types/product.ts`.
- No `console.log` in request handlers.
- No new npm packages without an explicit instruction to add them.








Layer



Choice





Runtime



Node.js 18+





Language



TypeScript 5 (strict)





Framework



Express 4





Testing



Jest + Supertest + ts-jest





Validation



Manual typeof guards — Zod is installed but not yet adopted



Architecture rules





express.Router is only used inside src/routes/. Never instantiate it in app.ts or elsewhere.



All types come from src/types/product.ts (Product, NewProduct). Never redefine them inline.



No any — use unknown, Partial<T>, or a precise type.



All files must compile cleanly with npm run build before committing.



Never add a dependency without updating package.json and package-lock.json.



Code conventions





All Express handlers are async, even if they don't currently await anything.



Always use explicit return on responses: return res.json(...) / return res.status(400).json(...). Never fall through.



Variable names: camelCase. File names: kebab-case.



No console.log in handlers. Use console.error only inside the global error handler (src/middleware/errorHandler.ts).



API surface

GET /api/health

200 { status: "ok", timestamp: string }   // ISO 8601

GET /api/products

Query params: page (default 1), limit (default 10)
200 { data: Product[], total: number, page: number, limit: number }
400 { error: string }   // if page < 1 or limit < 1

POST /api/products

Body: { name: string, price: number, category?: string }
201 Product
400 { error: string, details?: Record<string, string> }



Validation rules

Apply these checks in order. Return 400 on the first failure with a descriptive error string.

// name
typeof name === 'string' && name.trim().length > 0

// price
typeof price === 'number' && Number.isFinite(price) && price >= 0

// category (optional)
category === undefined || typeof category === 'string'

details in the 400 response is optional but recommended for multi-field errors:

{ "error": "Validation failed", "details": { "price": "must be a non-negative finite number" } }



Testing conventions





Test files live in src/routes/__tests__/*.test.ts.



Standard import pattern:

import request from 'supertest';
import { createApp } from '../../app';



Each describe block maps to one endpoint. Each it covers one case.



Tests are fully isolated — call createApp() inside each test or in beforeEach. Never share app instances or store state across tests.



Cover both happy path and edge cases (invalid types, missing fields, boundary values for pagination).



What NOT to generate





No ORM, no database client, no external HTTP calls.



No shared mutable state outside src/data/products.ts.



No express.Router outside src/routes/.



No inline type definitions duplicating src/types/product.ts.



No console.log in request handlers.



No new npm packages without an explicit instruction to add them.

