import { ORPCError, ValidationError } from '@orpc/server';

const MAX_RESULT_CHARS = 40_000;

export interface IssuedReference {
  ref: string;
  type: string;
  label: string;
}

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

export const bounded = (result: unknown, issued: IssuedReference[] = []) => {
  const json = JSON.stringify(result ?? null);
  const references = issued.length ? { references: issued } : {};

  return json.length > MAX_RESULT_CHARS
    ? {
        ok: true as const,
        truncated: true,
        result: json.slice(0, MAX_RESULT_CHARS),
        note: 'The answer was cut. Ask for less: add filters, a smaller limit, or fewer fields.',
        ...references,
      }
    : { ok: true as const, result, ...references };
};
