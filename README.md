# workshop-starter

Progetto starter **Express + TypeScript** per il *Workshop AI per Sviluppatori — Modulo 2: AI-Assisted Coding*.
È lo stesso progetto che si evolve lungo i quattro laboratori del modulo (e che hai inizializzato nel Lab 3 del Modulo 1).

## Prerequisiti
- Node.js 18+ e npm
- VS Code con le estensioni **GitHub Copilot** e **GitHub Copilot Chat**
- (consigliata) estensione **REST Client** per usare `requests.http`

## Setup
```bash
npm install
npm run dev          # avvia in watch su http://localhost:3000
```
Verifica rapida (endpoint di esempio già implementato):
```bash
curl http://localhost:3000/api/health
# {"status":"ok","timestamp":"..."}
```

## Script
| Comando | Cosa fa |
| --- | --- |
| `npm run dev` | Avvia il server in watch con tsx (transpile-only) |
| `npm run build` | Compila con `tsc` in `dist/` |
| `npm start` | Esegue la build compilata |
| `npm test` | Esegue i test Jest |

## Struttura
```
workshop-starter/
├── src/
│   ├── index.ts                 Bootstrap: avvia il server sulla porta 3000
│   ├── app.ts                   Crea/configura l'app Express (testabile)
│   ├── types/product.ts         Modello Product (+ NewProduct)
│   ├── data/products.ts         Store in memoria con dati di esempio
│   ├── routes/
│   │   ├── health.ts            ✅ GET /api/health — esempio di riferimento
│   │   ├── products.ts          ⬅️ DA COMPLETARE nel Lab 1 (GET + POST)
│   │   └── __tests__/health.test.ts   Test di esempio (modello per il Lab 2)
│   └── middleware/errorHandler.ts     ⚠️ contiene un bug intenzionale (Lab 1 · C)
├── requests.http                Richieste pronte (REST Client)
├── jest.config.js · tsconfig.json · package.json
└── .vscode/extensions.json
```

## Cosa farai nei laboratori
- **Lab 1** — Completa `src/routes/products.ts`: `GET /api/products` (inline + Inline Chat per la validazione page/limit) e `POST /api/products` (via Chat). Correggi il bug intenzionale in `src/middleware/errorHandler.ts` con **/fix**.
- **Lab 2** — Genera i test con `/tests` (salva in `src/routes/__tests__/products.test.ts`), il JSDoc con `/doc`, e crea `.github/copilot-instructions.md`.
- **Lab 4** — Il componente React `ProductCard` consumerà `GET /api/products`. ⚠️ Nota porte: l'API gira sulla `:3000`; se il frontend usa un dev server separato, configura un proxy o abilita CORS.

## Nota sul bug intenzionale (risolto)
Il bug del Lab 1 in `src/middleware/errorHandler.ts` — l'accesso a `err.status`, proprietà inesistente sul tipo `Error` — è già stato corretto: il file definisce ora un'interfaccia `AppError extends Error` con `status?: number`. `npm run build` compila correttamente.

---

## API Endpoints

Il server gira su `http://localhost:3000`. Tutti gli endpoint sono prefissati con `/api`.

### `GET /api/health`

Health-check. Utile per verificare che il server sia up.

```bash
curl http://localhost:3000/api/health
```

**Response 200**
```json
{ "status": "ok", "timestamp": "2026-06-16T10:00:00.000Z" }
```

---

### `GET /api/products`

Restituisce la lista paginata dei prodotti.

| Query param | Tipo    | Default | Note                        |
|-------------|---------|---------|-----------------------------|
| `page`      | integer | `1`     | Deve essere ≥ 1             |
| `limit`     | integer | `10`    | Deve essere ≥ 1             |

```bash
# Tutti i prodotti (prima pagina, limite 10)
curl http://localhost:3000/api/products

# Pagina 2 con 2 prodotti per pagina
curl "http://localhost:3000/api/products?page=2&limit=2"
```

**Response 200**
```json
[
  { "id": 1, "name": "Wireless Mouse", "price": 29.99, "category": "electronics" },
  { "id": 2, "name": "Mechanical Keyboard", "price": 89.00, "category": "electronics" }
]
```

**Response 400** — `page` o `limit` < 1
```json
{ "error": "page and limit must be positive integers" }
```

---

### `POST /api/products`

Crea un nuovo prodotto e lo aggiunge allo store in memoria.

| Campo      | Tipo   | Obbligatorio | Note                  |
|------------|--------|--------------|-----------------------|
| `name`     | string | ✅           | Non può essere vuoto  |
| `price`    | number | ✅           | Deve essere un numero finito |
| `category` | string | ❌           | Opzionale             |

```bash
# Creazione valida → 201
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "USB-C Cable", "price": 12.99, "category": "electronics"}'

# Senza category → 201
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Sticky Notes", "price": 2.50}'

# Body non valido → 400
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"price": "non-un-numero"}'
```

**Response 201**
```json
{ "id": 5, "name": "USB-C Cable", "price": 12.99, "category": "electronics" }
```

**Response 400**
```json
{
  "error": "Validation failed",
  "details": {
    "name": "name must be a non-empty string",
    "price": "price must be a valid number",
    "category": "category must be a string when provided"
  }
}
```

---

## Eseguire i test

```bash
npm test
```

Esegue l'intera suite Jest (transpilazione con `ts-jest`):

```
PASS  src/routes/__tests__/health.test.ts
PASS  src/routes/__tests__/products.test.ts

Test Suites: 2 passed, 2 total
Tests:       12 passed, 12 total
```

Per eseguire solo i test di un file specifico:

```bash
npx jest src/routes/__tests__/products.test.ts
```

Per eseguire in modalità watch (utile durante lo sviluppo):

```bash
npx jest --watch
```
