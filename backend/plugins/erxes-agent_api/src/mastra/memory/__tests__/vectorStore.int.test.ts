import { health, ensureCollection, upsert, search } from '../vectorStore';

// Integration tests against a live Qdrant. Skipped unless ERXES_AGENT_QDRANT_URL is
// set (e.g. after: docker compose -f backend/plugins/erxes-agent_api/docker-compose.yml up -d
// ERXES_AGENT_QDRANT_URL=http://localhost:6333 pnpm nx test erxes-agent_api).
const RUN = Boolean(process.env.ERXES_AGENT_QDRANT_URL);
const maybeDescribe = RUN ? describe : describe.skip;

const COLLECTION = 'mastra_memory_inttest_8';
const DIM = 8;
const baseUrl = process.env.ERXES_AGENT_QDRANT_URL || 'http://localhost:6333';

// Deterministic unit-ish vector so cosine distance is meaningful.
function vec(seed: number): number[] {
  const vector = Array.from({ length: DIM }, (_, i) =>
    Math.sin(seed * (i + 1)),
  );
  const norm =
    Math.sqrt(vector.reduce((sum, item) => sum + item * item, 0)) || 1;
  return vector.map((item) => item / norm);
}

maybeDescribe('qdrant vector store (integration)', () => {
  afterAll(async () => {
    await fetch(`${baseUrl}/collections/${COLLECTION}`, {
      method: 'DELETE',
    }).catch(() => undefined);
  });

  it('AM-VEC-4: health() is true when Qdrant is up', async () => {
    expect(await health()).toBe(true);
  });

  it('AM-VEC-1/2: ensureCollection creates with the right dim and is idempotent', async () => {
    await ensureCollection(COLLECTION, DIM);
    await ensureCollection(COLLECTION, DIM); // second call must not throw

    const res = await fetch(`${baseUrl}/collections/${COLLECTION}`);
    const json = (await res.json()) as {
      result: { config: { params: { vectors: { size: number } } } };
    };
    expect(json.result.config.params.vectors.size).toBe(DIM);
  });

  it('AM-VEC-3: upsert then search returns the point with its payload', async () => {
    await ensureCollection(COLLECTION, DIM);
    await upsert(COLLECTION, [
      { id: 1, vector: vec(1), payload: { subdomain: 'acme', text: 'alpha' } },
      { id: 2, vector: vec(50), payload: { subdomain: 'acme', text: 'beta' } },
    ]);

    const hits = await search(COLLECTION, vec(1), { topK: 1 });
    expect(hits.length).toBe(1);
    expect(hits[0].id).toBe(1);
    expect(hits[0].payload.text).toBe('alpha');
  });
});
