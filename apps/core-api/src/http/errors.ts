import { ORPCError } from '@orpc/server';

/**
 * An error the API answers with (oRPC's error body: `{ code, status, message, data }`).
 * Services throw it; clients branch on `code`.
 */
export class HttpError extends ORPCError<string, unknown> {
  constructor(
    status: 400 | 401 | 403 | 404 | 409 | 429,
    code: string,
    message: string,
    data?: unknown,
  ) {
    super(code, { status, message, data });
  }
}

export const notFound = (what: string) => new HttpError(404, 'NOT_FOUND', `${what} not found`);

export const forbidden = (code: string, message: string) => new HttpError(403, code, message);

/** The pg error behind a Drizzle error (DrizzleQueryError wraps it in `cause`). */
export const pgCode = (error: unknown): string | undefined => {
  let current: unknown = error;

  for (let depth = 0; depth < 4 && current; depth += 1) {
    const code = (current as { code?: unknown }).code;

    if (typeof code === 'string' && /^[0-9A-Z]{5}$/.test(code)) {
      return code;
    }

    current = (current as { cause?: unknown }).cause;
  }

  return undefined;
};

/** The constraint a pg error names, e.g. which unique index a 23505 hit. */
export const pgConstraint = (error: unknown): string | undefined => {
  let current: unknown = error;

  for (let depth = 0; depth < 4 && current; depth += 1) {
    const constraint = (current as { constraint?: unknown }).constraint;

    if (typeof constraint === 'string') {
      return constraint;
    }

    current = (current as { cause?: unknown }).cause;
  }

  return undefined;
};
