import { buildCreateBody, buildSearchBody } from '../vectorStore';

describe('qdrant request builders', () => {
  // AM-VEC-1 (body shape): collection is created with the embedder's vector
  // size and cosine distance.
  it('buildCreateBody sizes the collection and uses Cosine', () => {
    expect(buildCreateBody(384)).toEqual({
      vectors: { size: 384, distance: 'Cosine' },
    });
    expect(buildCreateBody(1536).vectors.size).toBe(1536);
  });

  it('buildSearchBody requests payloads and respects topK', () => {
    expect(buildSearchBody([0.1, 0.2, 0.3], 4)).toEqual({
      vector: [0.1, 0.2, 0.3],
      limit: 4,
      with_payload: true,
    });
  });

  it('buildSearchBody includes a filter only when provided', () => {
    const withFilter = buildSearchBody([0.1], 3, {
      must: [{ key: 'subdomain', match: { value: 'acme' } }],
    });
    expect(withFilter.filter).toBeDefined();
    expect(
      (buildSearchBody([0.1], 3) as { filter?: unknown }).filter,
    ).toBeUndefined();
  });
});
