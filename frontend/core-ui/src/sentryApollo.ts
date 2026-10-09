import * as Sentry from '@sentry/react';

export type ApolloFailure = {
  operation: string;
  kind: 'graphql' | 'network';
  message: string;
  code?: string;
  status?: number;
  path?: string;
};

type GraphQLErrorLike = {
  message: string;
  path?: readonly (string | number)[];
  extensions?: Record<string, unknown>;
};
type NetworkErrorLike =
  | { message?: string; statusCode?: number; name?: string }
  | null
  | undefined;

const EXPECTED = [
  /login required/i,
  /not authenticated/i,
  /unauthori[sz]ed/i,
  /forbidden/i,
  /permission/i,
  /scope required/i,
  /portal (user )?required/i,
  /is required/i,
  /are required/i,
  /already exists/i,
  /must be/i,
  /invalid (email|password|code|token)/i,
  /wrong password/i,
  /not allowed/i,
  /aborted/i,
];
const EXPECTED_CODES = new Set([
  'UNAUTHENTICATED',
  'FORBIDDEN',
  'BAD_USER_INPUT',
  'PERSISTED_QUERY_NOT_FOUND',
]);

export function normalizeMessage(message: string): string {
  return message
    .replace(/"[^"\n]*"/g, '"<v>"')
    .replace(/'[^'\n]*'/g, "'<v>'")
    .replace(
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
      '<id>',
    )
    .replace(/\b[0-9a-f]{24}\b/gi, '<id>')
    .replace(
      /(^|[^A-Za-z0-9_-])([A-Za-z0-9_-]{16,32})(?![A-Za-z0-9_-])/g,
      (_m, pre: string, t: string) =>
        pre + (/[A-Za-z]/.test(t) && /\d/.test(t) ? '<id>' : t),
    )
    .replace(/\b\d+(?:\.\d+)?\b/g, '<n>')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 300);
}

export function toFailures(input: {
  operationName?: string;
  graphQLErrors?: readonly GraphQLErrorLike[];
  networkError?: NetworkErrorLike;
}): ApolloFailure[] {
  const operation = input.operationName || 'anonymous';
  const out: ApolloFailure[] = [];
  for (const e of input.graphQLErrors || []) {
    const code =
      typeof e.extensions?.code === 'string'
        ? (e.extensions.code as string)
        : undefined;
    if (
      (code && EXPECTED_CODES.has(code)) ||
      EXPECTED.some((p) => p.test(e.message))
    )
      continue;
    out.push({
      operation,
      kind: 'graphql',
      message: e.message,
      code,
      path: e.path?.join('.'),
    });
  }
  const n = input.networkError;
  if (n && !out.length) {
    const status = n.statusCode;
    const message = n.message || n.name || 'Network error';
    const worth =
      status === undefined
        ? !/aborted|cancel/i.test(message)
        : status >= 500 || status === 400 || status === 404;
    if (worth) out.push({ operation, kind: 'network', message, status });
  }
  return out;
}

export const fingerprintOf = (f: ApolloFailure) => [
  'graphql',
  f.kind,
  f.operation,
  f.code || String(f.status ?? ''),
  normalizeMessage(f.message),
];

const lastSent = new Map<string, number>();
let windowStart = 0;
let windowCount = 0;
export function shouldReport(key: string, now = Date.now()): boolean {
  if (now - windowStart > 5 * 60e3) {
    windowStart = now;
    windowCount = 0;
  }
  if (windowCount >= 20) return false;
  const prev = lastSent.get(key);
  if (prev !== undefined && now - prev < 60e3) return false;
  lastSent.set(key, now);
  windowCount += 1;
  return true;
}

export function reportApolloError(
  input: Parameters<typeof toFailures>[0],
): void {
  for (const f of toFailures(input)) {
    const fingerprint = fingerprintOf(f);
    if (!shouldReport(fingerprint.join('|'))) continue;
    Sentry.withScope((scope) => {
      scope.setTag('graphql.operation', f.operation);
      scope.setTag('graphql.kind', f.kind);
      if (f.code) scope.setTag('graphql.code', f.code);
      if (f.status !== undefined) scope.setTag('http.status', String(f.status));
      scope.setContext('graphql', {
        operation: f.operation,
        kind: f.kind,
        code: f.code,
        status: f.status,
        path: f.path,
      });
      scope.setFingerprint(fingerprint);
      const err = new Error(`${f.operation}: ${f.message}`);
      err.name = f.kind === 'network' ? 'GraphQLNetworkError' : 'GraphQLError';
      Sentry.captureException(err);
    });
  }
}
