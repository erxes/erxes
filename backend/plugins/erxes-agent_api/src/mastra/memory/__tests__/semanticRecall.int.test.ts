import { ensureCollection, upsert, search } from '../vectorStore';
import { buildRecallFilter, toPoint, pointIdFor } from '../semanticRecall';

// Gated: only runs when ERXES_AGENT_QDRANT_URL is set. Uses synthetic vectors so no
// embedder is required — this isolates the tenant-filtering behavior.
const RUN = Boolean(process.env.ERXES_AGENT_QDRANT_URL);
const maybeDescribe = RUN ? describe : describe.skip;

const COLLECTION = 'mastra_memory_tenant_inttest_8';
const DIM = 8;
const baseUrl = process.env.ERXES_AGENT_QDRANT_URL || 'http://localhost:6333';

function vec(seed: number): number[] {
  const vector = Array.from({ length: DIM }, (_, i) =>
    Math.sin(seed * (i + 1)),
  );
  const norm =
    Math.sqrt(vector.reduce((sum, item) => sum + item * item, 0)) || 1;
  return vector.map((item) => item / norm);
}

function point(subdomain: string, id: string, seed: number, text: string) {
  return toPoint({
    pointId: pointIdFor(subdomain, id),
    messageId: id,
    vector: vec(seed),
    subdomain,
    resourceId: 'u-shared', // same resourceId string across tenants on purpose
    threadId: 't1',
    agentId: 'a1',
    role: 'user',
    text,
  });
}

maybeDescribe('semantic recall — tenant isolation (integration)', () => {
  beforeAll(async () => {
    await ensureCollection(COLLECTION, DIM);
    await upsert(COLLECTION, [
      point('acme', 'm1', 1, 'acme secret'),
      point('globex', 'm2', 1, 'globex secret'), // identical vector, different tenant
    ]);
  });

  afterAll(async () => {
    await fetch(`${baseUrl}/collections/${COLLECTION}`, {
      method: 'DELETE',
    }).catch(() => undefined);
  });

  it('AM-TEN-5: querying as one tenant never returns another tenant data', async () => {
    const filter = buildRecallFilter({
      subdomain: 'acme',
      scope: 'resource',
      resourceId: 'u-shared',
    });
    const hits = await search(COLLECTION, vec(1), { topK: 10, filter });
    expect(hits.length).toBeGreaterThan(0);
    expect(hits.every((h) => h.payload.subdomain === 'acme')).toBe(true);
    expect(hits.some((h) => h.payload.text === 'globex secret')).toBe(false);
  });

  it('AM-TEN-6: a tenant with no data gets an empty result, no leakage', async () => {
    const filter = buildRecallFilter({
      subdomain: 'initech',
      scope: 'resource',
      resourceId: 'u-shared',
    });
    const hits = await search(COLLECTION, vec(1), { topK: 10, filter });
    expect(hits.length).toBe(0);
  });
});
