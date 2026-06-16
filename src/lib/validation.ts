// Costruzione condivisa della risposta di errore di validazione.
// Garantisce che `details` contenga SOLO i campi effettivamente invalidi
// (prima ogni handler restituiva i messaggi di tutti i campi, anche di quelli
// validi — fuorviante per il client).

export interface FieldCheck {
  valid: boolean;
  message: string;
}

export interface ValidationError {
  error: string;
  details: Record<string, string>;
}

/**
 * Esito di una validazione di dominio: il valore normalizzato in caso di
 * successo, oppure l'errore pronto per la risposta 400.
 */
export type ValidationResult<T> = { value: T } | { error: ValidationError };

/**
 * Raccoglie gli errori dei campi che non hanno superato la validazione.
 *
 * @param checks - Mappa campo → { valid, message }.
 * @returns `null` se tutti i campi sono validi, altrimenti
 *          `{ error: 'Validation failed', details }` con i soli campi falliti.
 */
export function collectValidationErrors(
  checks: Record<string, FieldCheck>,
): ValidationError | null {
  const details: Record<string, string> = {};
  for (const [field, check] of Object.entries(checks)) {
    if (!check.valid) {
      details[field] = check.message;
    }
  }

  return Object.keys(details).length > 0
    ? { error: 'Validation failed', details }
    : null;
}
