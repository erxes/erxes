import { ORPCError, ValidationError } from '@orpc/server';

const MAX_RESULT_CHARS = 40_000;

export interface IssuedReference {
  ref: string;
  type: string;
  label: string;
}

/** A JSON answer or tool result, else its text as it is (null when empty). */
export const jsonOf = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    return text === '' ? null : text;
  }
};

export const refusal = (code: string, message: string, extra: Record<string, unknown> = {}) => ({
  ok: false as const,
  code,
  message,
  ...extra,
});

export const describeError = (error: unknown) => {
  if (!(error instanceof ORPCError)) throw error;

  const issues = error.cause instanceof ValidationError ? error.cause.issues : undefined;
  const code: unknown = error.code;

  return refusal(typeof code === 'string' ? code : 'ERROR', error.message, {
    status: error.status,
    ...(issues ? { issues } : {}),
  });
};

/**
 * Who reads a result. A model gets the first 40 000 characters of a long one, as text it can
 * still use. A program gets whole JSON up to a megabyte, or a refusal, never a cut string it
 * can't parse.
 */
export type Reader = 'model' | 'program';

const PROGRAM_RESULT_CHARS = 1_000_000;

export const bounded = (result: unknown, issued: IssuedReference[], reader: Reader) => {
  const json = JSON.stringify(result ?? null);
  const references = issued.length ? { references: issued } : {};

  if (json.length <= (reader === 'model' ? MAX_RESULT_CHARS : PROGRAM_RESULT_CHARS)) {
    return { ok: true as const, result, ...references };
  }

  if (reader === 'program') {
    return refusal(
      'TOO_LARGE',
      `The answer is over ${PROGRAM_RESULT_CHARS} characters. Ask for less: a smaller limit or filters.`,
    );
  }

  return {
    ok: true as const,
    truncated: true,
    result: json.slice(0, MAX_RESULT_CHARS),
    note: 'The answer was cut. Ask for less: add filters or a smaller limit, or use execute to page and pick fields.',
    ...references,
  };
};
