// ---------------------------------------------------------------------------
// Company Knowledge RAG — gateway GraphQL client.
//
// All company data is read through the erxes gateway so (a) this feature
// needs no coupling to other plugins' internals and (b) query-time fetches
// run under erxes's own permission layer — the authoritative post-filter.
//
// Auth: a `user` header (the asking user) when present — erxes resolves the
// request as that user — otherwise the API token from agent settings (used by
// the background sweep and the customer bot bridge).
// ---------------------------------------------------------------------------

import { asBearer } from '../tools/erxesTools';
import { GqlExec } from './contentTypes';

/** Pick the auth header for gateway calls: user session first, else app token. */
export function buildAuthHeaders(opts: {
  userHeader?: string;
  apiToken?: string;
}): Record<string, string> {
  if (opts.userHeader) return { user: opts.userHeader };
  if (opts.apiToken) return { Authorization: asBearer(opts.apiToken) };
  return {};
}

/** Bind apiUrl + auth headers into a reusable GraphQL executor. */
export function makeGqlExec(
  apiUrl: string,
  authHeaders: Record<string, string>,
): GqlExec {
  return async (query, variables) => {
    const res = await fetch(`${apiUrl}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders },
      body: JSON.stringify({ query, variables }),
    });
    if (!res.ok) {
      throw new Error(`Gateway GraphQL failed (${res.status})`);
    }
    const json = (await res.json()) as {
      data?: Record<string, unknown>;
      errors?: Array<{ message?: string }>;
    };
    if (json.errors?.length) {
      throw new Error(
        `Gateway GraphQL error: ${json.errors[0]?.message || 'unknown'}`,
      );
    }
    return json.data ?? {};
  };
}
