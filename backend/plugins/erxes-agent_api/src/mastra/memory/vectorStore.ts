// ---------------------------------------------------------------------------
// Qdrant vector store — accessed over its raw REST API via global fetch.
//
// We deliberately avoid the @mastra/qdrant SDK so the advanced-memory feature
// stays fully self-contained in this plugin (no new dependency, no root
// lockfile change). Qdrant's REST surface is tiny and stable.
//
// Pure request-body builders are exported separately so they can be unit-tested
// without a live Qdrant. The networked ops are integration-tested (gated).
// ---------------------------------------------------------------------------

import { qdrantUrl, qdrantApiKey } from './config';

export interface QdrantPoint {
  id: string | number;
  vector: number[];
  payload?: Record<string, unknown>;
}

export interface SearchHit {
  id: string | number;
  score: number;
  payload: Record<string, unknown>;
}

// ── Pure builders (unit-tested) ──────────────────────────────────────────────

export function buildCreateBody(dimension: number) {
  return { vectors: { size: dimension, distance: 'Cosine' } };
}

/** Search request body: vector + limit, payloads on, optional filter. */
export function buildSearchBody(
  vector: number[],
  topK: number,
  filter?: Record<string, unknown>,
) {
  return {
    vector,
    limit: topK,
    with_payload: true,
    ...(filter ? { filter } : {}),
  };
}

// ── Networked ops ────────────────────────────────────────────────────────────

/** Request headers: JSON content type plus the optional Qdrant api key. */
function headers(): Record<string, string> {
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const key = qdrantApiKey();
  if (key) requestHeaders['api-key'] = key;
  return requestHeaders;
}

/** True if Qdrant answers its health endpoint within 2s. Never throws. */
export async function health(baseUrl = qdrantUrl()): Promise<boolean> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 2000);
  try {
    const res = await fetch(`${baseUrl}/healthz`, {
      headers: headers(),
      signal: ctrl.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/** Create the collection if absent. Idempotent (treats exists/409 as success). */
export async function ensureCollection(
  name: string,
  dimension: number,
  baseUrl = qdrantUrl(),
): Promise<void> {
  const existing = await fetch(`${baseUrl}/collections/${name}`, {
    headers: headers(),
  });
  if (existing.ok) return;

  const res = await fetch(`${baseUrl}/collections/${name}`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify(buildCreateBody(dimension)),
  });
  if (!res.ok && res.status !== 409) {
    const text = await res.text().catch(() => '');
    throw new Error(`Qdrant ensureCollection failed (${res.status}): ${text}`);
  }
}

/** Insert-or-replace points (waits for write acknowledgement). */
export async function upsert(
  name: string,
  points: QdrantPoint[],
  baseUrl = qdrantUrl(),
): Promise<void> {
  if (!points.length) return;
  const res = await fetch(`${baseUrl}/collections/${name}/points?wait=true`, {
    method: 'PUT',
    headers: headers(),
    body: JSON.stringify({ points }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Qdrant upsert failed (${res.status}): ${text}`);
  }
}

export interface ScrolledPoint {
  id: string | number;
  payload: Record<string, unknown>;
}

/**
 * Scroll every point matching `filter` (payload only, no vectors). Pages
 * internally until exhausted — fine for the company-knowledge corpus sizes
 * this plugin deals with (thousands, not millions).
 */
export async function scroll(
  name: string,
  filter: Record<string, unknown>,
  baseUrl = qdrantUrl(),
): Promise<ScrolledPoint[]> {
  const points: ScrolledPoint[] = [];
  let offset: string | number | null = null;

  do {
    const res = await fetch(`${baseUrl}/collections/${name}/points/scroll`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({
        filter,
        limit: 256,
        with_payload: true,
        with_vector: false,
        ...(offset !== null ? { offset } : {}),
      }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Qdrant scroll failed (${res.status}): ${text}`);
    }
    const json = (await res.json()) as {
      result?: {
        points?: ScrolledPoint[];
        next_page_offset?: string | number | null;
      };
    };
    for (const point of json.result?.points || []) {
      points.push({ id: point.id, payload: point.payload || {} });
    }
    offset = json.result?.next_page_offset ?? null;
  } while (offset !== null);

  return points;
}

/** Merge payload keys into existing points without re-embedding. */
export async function setPayload(
  name: string,
  ids: Array<string | number>,
  payload: Record<string, unknown>,
  baseUrl = qdrantUrl(),
): Promise<void> {
  if (!ids.length) return;
  const res = await fetch(
    `${baseUrl}/collections/${name}/points/payload?wait=true`,
    {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ payload, points: ids }),
    },
  );
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Qdrant setPayload failed (${res.status}): ${text}`);
  }
}

/** Hard-delete points by id (waits for write acknowledgement). */
export async function deletePoints(
  name: string,
  ids: Array<string | number>,
  baseUrl = qdrantUrl(),
): Promise<void> {
  if (!ids.length) return;
  const res = await fetch(
    `${baseUrl}/collections/${name}/points/delete?wait=true`,
    {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ points: ids }),
    },
  );
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Qdrant deletePoints failed (${res.status}): ${text}`);
  }
}

/** Vector similarity search; returns scored hits with their payloads. */
export async function search(
  name: string,
  vector: number[],
  opts: { topK: number; filter?: Record<string, unknown> },
  baseUrl = qdrantUrl(),
): Promise<SearchHit[]> {
  const res = await fetch(`${baseUrl}/collections/${name}/points/search`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify(buildSearchBody(vector, opts.topK, opts.filter)),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Qdrant search failed (${res.status}): ${text}`);
  }
  const json = (await res.json()) as { result?: SearchHit[] };
  return (json.result || []).map((hit) => ({
    id: hit.id,
    score: hit.score,
    payload: hit.payload || {},
  }));
}
