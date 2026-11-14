import { ORPCError } from '@orpc/server';
import { DatabaseError } from 'pg';

/**
 * An error the API answers with (oRPC's error body: `{ code, status, message, data }`).
 * Services throw it; clients branch on `code`.
 */
export class HttpError extends ORPCError<string, unknown> {
  constructor(
    status: 400 | 401 | 402 | 403 | 404 | 409 | 429,
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
const databaseError = (error: unknown, depth = 0): DatabaseError | undefined => {
  if (error instanceof DatabaseError) return error;

  return error instanceof Error && depth < 4 ? databaseError(error.cause, depth + 1) : undefined;
};

/** The SQLSTATE of the pg error behind `error`, e.g. 23505 for a unique violation. */
export const pgCode = (error: unknown) => databaseError(error)?.code;

/** The constraint a pg error names, e.g. which unique index a 23505 hit. */
export const pgConstraint = (error: unknown) => databaseError(error)?.constraint;
