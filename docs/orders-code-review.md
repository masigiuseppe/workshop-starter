# Code Review — Feature *Orders*

> Analisi dei code smell nei file che compongono la feature ordini.
> Nota: non esiste una cartella `src/orders/`; la feature è distribuita su
> `src/routes/orders.ts`, `src/data/orders.ts`, `src/types/order.ts` e
> `src/routes/__tests__/orders.test.ts`.

> **Aggiornamento** — I fix a basso/medio rischio **#1, #4, #5, #6, #7** sono
> stati applicati (helper condivisi `src/lib/pagination.ts` e
> `src/lib/validation.ts`; route `orders` e `products` refactorate; test
> aggiunti per `details` per-campo). Build pulita, 25/25 test verdi.
> Restano aperti: **#2, #3** (refactor architetturale — repository/separazione
> livelli), **#8, #9** (cambiano contratto del tipo / semantica di dominio).

## Sintesi

Il codice è **piccolo e nel complesso pulito**. Due delle categorie richieste
non si manifestano davvero qui e lo segnalo onestamente:

- **Funzioni troppo lunghe** — ❌ non presente. I due handler sono ~12 e ~27
  righe, ben dentro soglie ragionevoli.
- **Nesting eccessivo** — ❌ non presente. Profondità massima 2 livelli
  (handler → `if`). Nessuna piramide di condizioni.

I problemi reali, in ordine di impatto, sono:

| # | Smell | Categoria | Gravità | Stato |
|---|-------|-----------|---------|-------|
| 1 | Duplicazione paginazione tra `orders` e `products` | Duplicazione (DRY) | Alta | ✅ Risolto |
| 2 | Handler con troppe responsabilità (parsing+validazione+persistenza+HTTP) | SRP | Alta | ⬜ Aperto |
| 3 | Accoppiamento diretto allo store in memoria | DIP / OCP | Alta | ⬜ Aperto |
| 4 | `details` del 400 elenca sempre tutti i campi | Correttezza / chiarezza | Media | ✅ Risolto |
| 5 | Duplicazione del messaggio/forma dell'errore di validazione | Duplicazione (DRY) | Media | ✅ Risolto |
| 6 | Gestione di `limit`/`page` incoerente tra le due route | Coerenza | Media | ✅ Risolto |
| 7 | Nessun limite massimo su `limit` | Robustezza | Bassa | ✅ Risolto |
| 8 | `status` come `string` libera anziché union tipata | Type modeling | Bassa | ⬜ Aperto |
| 9 | `productId` non verificato contro lo store prodotti | Integrità dominio | Bassa (by design?) | ⬜ Aperto |

---

## Dettaglio

### 1. Duplicazione della logica di paginazione — *Alta* — ✅ RISOLTO

`src/routes/orders.ts:18-30` e `src/routes/products.ts` (handler `GET /`)
contengono quasi la stessa logica: parsing di `page`/`limit`, controllo `< 1`,
calcolo `startIndex`/`endIndex`, `slice`. È duplicazione classica: ogni
correzione (es. aggiungere un tetto a `limit`) va replicata in due punti e
prima o poi divergeranno — cosa **già in corso**, vedi smell #6.

**Refactor** — estrarre un helper condiviso:

```ts
// src/lib/paginate.ts
export function paginate<T>(items: T[], pageRaw: unknown, limitRaw: unknown) {
  const page = parseInt(String(pageRaw), 10) || 1;
  const limit = parseInt(String(limitRaw), 10) || 10;
  if (page < 1 || limit < 1) return { error: 'page and limit must be positive integers' as const };
  const start = (page - 1) * limit;
  return { data: items.slice(start, start + limit) };
}
```

> **Risolto** in `src/lib/pagination.ts`. Entrambe le route ora delegano a
> `paginate(items, req.query.page, req.query.limit)` (gli `slice`/`startIndex`
> inline sono spariti). L'helper distingue parametri assenti/non numerici
> (→ default) da valori `< 1` (→ 400), così il comportamento di `?limit=0`
> diventa identico nelle due API (vedi #6).

### 2. Handler con troppe responsabilità (SRP) — *Alta*

`router.post('/')` (`src/routes/orders.ts:44-71`) fa, da solo: lettura body,
validazione, costruzione dell'entità, generazione id, **persistenza**
(`orders.push`) e formattazione della risposta HTTP. Cinque responsabilità in
una funzione. Conseguenza pratica: la regola di validazione non è riutilizzabile
né testabile in isolamento dal layer HTTP, e la logica di dominio è intrecciata
con Express.

**Refactor** — separare in livelli: un `validateNewOrder(body): Result`, un
`ordersRepository.create(newOrder)` e l'handler che si limita a orchestrare e
tradurre in status code.

### 3. Accoppiamento diretto allo store in memoria (DIP/OCP) — *Alta*

La route importa direttamente l'array concreto e la funzione id da
`../data/orders` (`src/routes/orders.ts:2`). Il layer di trasporto dipende da un
dettaglio di implementazione della persistenza. Sostituire l'in-memory con un DB
significherebbe riscrivere gli handler, non solo lo storage — violazione di
Dependency Inversion / Open-Closed.

**Refactor** — introdurre un'interfaccia repository:

```ts
interface OrderRepository {
  list(): Order[];
  create(o: NewOrder): Order;
}
```

La route dipende dall'interfaccia; l'implementazione in memoria è iniettabile.
(Coerente con la regola di progetto "no DB/ORM": resta in memoria, ma dietro
un'astrazione.)

### 4. `details` del 400 elenca sempre tutti i campi — *Media* (anche bug di chiarezza) — ✅ RISOLTO

`src/routes/orders.ts:51-60`: se **uno solo** dei campi è invalido, la risposta
restituisce comunque i messaggi d'errore per `productId`, `quantity` **e**
`status`. Un client che invia `productId` valido ma `quantity: 0` riceve
"productId must be a positive integer", che è falso e fuorviante.

**Refactor** — popolare `details` solo con i campi effettivamente falliti:

```ts
const details: Record<string, string> = {};
if (!isProductIdValid) details.productId = 'productId must be a positive integer';
if (!isQuantityValid)  details.quantity  = 'quantity must be a positive integer';
if (!isStatusValid)    details.status    = 'status must be a string when provided';
if (Object.keys(details).length) return res.status(400).json({ error: 'Validation failed', details });
```

> Nota: lo stesso difetto esiste anche in `products.ts`. I test attuali
> (`orders.test.ts:48-86`) verificano solo `res.body.error` definito, quindi
> **non intercettano** questo problema — falso senso di copertura.

> **Risolto** con `collectValidationErrors()` in `src/lib/validation.ts`:
> popola `details` con i soli campi falliti. Corretto in entrambe le route.
> Aggiunti test mirati (`orders.test.ts` e `products.test.ts`) che verificano
> che `details` contenga solo il campo invalido — chiudendo il buco di copertura
> segnalato qui sopra.

### 5. Duplicazione della forma dell'errore di validazione — *Media* — ✅ RISOLTO

La struttura `{ error: 'Validation failed', details: {...} }` è ripetuta
verbatim in `orders.ts` e `products.ts`. Una volta corretto lo smell #4,
conviene centralizzare la costruzione della risposta di validazione in un helper
condiviso per evitare di ri-divergere.

> **Risolto**: la forma `{ error, details }` è ora prodotta in un solo punto da
> `collectValidationErrors()` (`src/lib/validation.ts`); entrambe le route la
> riusano.

### 6. Gestione di `limit`/`page` incoerente tra le route — *Media* — ✅ RISOLTO

Le due route, nate per copia-incolla, **trattano `limit` in modo diverso**:

- `orders.ts:20-21`: gestione esplicita di `NaN` → default 10.
- `products.ts`: `parseInt(...) || 10`, dove `0` (falsy) diventa 10.

Quindi `?limit=0` si comporta diversamente nelle due API. È esattamente il tipo
di divergenza che la duplicazione (#1) provoca. Unificare con l'helper #1 elimina
l'incoerenza.

> **Risolto**: con `paginate()` condiviso le due route hanno semantica
> identica. `?limit=0` ora risponde **400** su entrambe (0 è trattato come
> valore presente ma `< 1`, non più come falsy → default).

### 7. Nessun limite massimo su `limit` — *Bassa* — ✅ RISOLTO

`?limit=1000000` produce uno `slice` enorme senza tetto. Su uno store in memoria
è innocuo, ma è un'abitudine fragile. Aggiungere un cap (es. `Math.min(limit, 100)`)
nell'helper di paginazione.

> **Risolto**: `paginate()` applica `MAX_LIMIT = 100` (`Math.min(rawLimit,
> MAX_LIMIT)`).

### 8. `status` come `string` libera — *Bassa*

`src/types/order.ts:6`: `status?: string`. I dati di esempio usano solo
`'pending'` / `'completed'`, ma il tipo accetta qualsiasi stringa e la
validazione (`orders.ts:49`) controlla solo `typeof === 'string'`. Modellare con
una union (`type OrderStatus = 'pending' | 'completed' | ...`) darebbe sicurezza
di tipo e validazione coerente.

### 9. `productId` non verificato contro lo store prodotti — *Bassa*

`POST /api/orders` accetta qualsiasi `productId` intero positivo, anche
inesistente (`orders.ts:47`). Potrebbe essere voluto per semplicità del
workshop, ma è un buco di integrità del dominio: si possono creare ordini
"orfani". Da valutare se rientra negli scopi.

---

## Note sui test (`orders.test.ts`)

I test coprono bene gli status code happy/edge. Il buco di copertura su
`details` (asserivano solo `res.body.error` *definito*) è stato **chiuso**:
ora c'è un test per route che verifica che `details` contenga solo il campo
invalido. Resta una fragilità latente: lo store **non** si resetta tra una
`createApp()` e l'altra (gli array in `src/data/` vivono per l'intero processo),
quindi i `POST` accumulano record. I test attuali reggono perché non asseriscono
mai conteggi assoluti, ma è da tenere a mente.

## Priorità consigliata

1. ✅ ~~Estrarre l'helper di paginazione (#1, #6, #7)~~ — fatto.
2. ✅ ~~Correggere `details` per-campo (#4) e centralizzare la risposta di errore (#5)~~ — fatto.
3. ⬜ Introdurre il repository e separare validazione/dominio/HTTP (#2, #3) — più
   invasivo; valutarlo come refactor architetturale dedicato.
4. ⬜ Opzionali: union tipata per `status` (#8), integrità referenziale di
   `productId` (#9).
