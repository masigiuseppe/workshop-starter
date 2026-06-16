# Copilot Instructions — workshop-starter

## Progetto
API REST **Express + TypeScript** per il Workshop AI per Sviluppatori (Modulo 2).  
Store in memoria (no database). Architettura: `app.ts` → `routes/` → `data/` → `types/`.

## Stack
- **Runtime**: Node.js 18+ / TypeScript 5
- **Framework**: Express 4
- **Test**: Jest + Supertest + ts-jest
- **Validazione**: manuale (typeof guard) — Zod è disponibile ma non ancora usato

## Convenzioni di codice

- Usa `async/await` su tutti gli handler Express.
- Restituisci sempre esplicitamente (`return res.json(...)` / `return res.status(...).json(...)`).
- Tipi: usa i tipi da `src/types/product.ts` (`Product`, `NewProduct`); non ridefinirli inline.
- Nomi variabili in **camelCase**, nomi file in **kebab-case**.
- Nessun `any` esplicito — usa `Partial<T>` o tipi precisi.
- Tutti i file TypeScript devono compilare senza errori con `npm run build`.

## Struttura route
```
GET  /api/products          → 200 array paginato | 400 se page/limit < 1
POST /api/products          → 201 prodotto creato | 400 se validazione fallisce
GET  /api/health            → 200 { status, timestamp }
```

## Validazione input
- `name`: `typeof name === 'string' && name.trim().length > 0`
- `price`: `typeof price === 'number' && Number.isFinite(price)`
- `category`: opzionale — se presente, `typeof category === 'string'`
- Errori 400: `{ error: string, details?: object }`

## Test
- File di test in `src/routes/__tests__/*.test.ts`.
- Pattern: `import request from 'supertest'; import { createApp } from '../../app';`
- Ogni `describe` corrisponde a un endpoint; ogni `it` a un caso (happy path + edge case).
- I test non condividono stato: ogni test chiama `createApp()` per ottenere un'istanza fresca.

## Da NON fare
- Non usare `express.Router` al di fuori di `src/routes/`.
- Non modificare `src/data/products.ts` nei test (lo store si resetta a ogni `createApp()`).
- Non aggiungere dipendenze senza aggiornare `package.json`.
- Non usare `console.log` negli handler (usa `console.error` solo nell'errorHandler).
