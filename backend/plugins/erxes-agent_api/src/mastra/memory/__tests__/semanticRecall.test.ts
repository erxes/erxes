import {
  buildRecallFilter,
  toPoint,
  filterHitsByScore,
  formatRecallBlock,
  pointIdFor,
} from '../semanticRecall';

describe('semantic recall — pure helpers', () => {
  // ── Tenant isolation (AM-TEN-1..4) ───────────────────────────────────────
  describe('buildRecallFilter', () => {
    it('AM-TEN-1: resource scope filters subdomain AND resourceId', () => {
      const filter = buildRecallFilter({
        subdomain: 'acme',
        scope: 'resource',
        resourceId: 'u1',
      });
      expect(filter.must).toEqual([
        { key: 'subdomain', match: { value: 'acme' } },
        { key: 'resourceId', match: { value: 'u1' } },
      ]);
    });

    it('AM-TEN-2: thread scope filters subdomain AND threadId, no resourceId', () => {
      const filter = buildRecallFilter({
        subdomain: 'acme',
        scope: 'thread',
        threadId: 't1',
      });
      expect(filter.must).toEqual([
        { key: 'subdomain', match: { value: 'acme' } },
        { key: 'threadId', match: { value: 't1' } },
      ]);
    });

    it('AM-TEN-3: refuses to build a filter without a subdomain (fail-closed)', () => {
      expect(() =>
        buildRecallFilter({
          subdomain: '',
          scope: 'resource',
          resourceId: 'u1',
        }),
      ).toThrow(/subdomain/i);
    });
  });

  it('AM-TEN-4: toPoint payload carries full tenant context', () => {
    const point = toPoint({
      pointId: 'pid',
      messageId: 'm1',
      vector: [0.1, 0.2],
      subdomain: 'acme',
      resourceId: 'u1',
      threadId: 't1',
      agentId: 'a1',
      role: 'user',
      text: 'hello',
      createdAt: '2026-01-01T00:00:00Z',
    });
    expect(point.id).toBe('pid');
    expect(point.payload).toMatchObject({
      subdomain: 'acme',
      resourceId: 'u1',
      threadId: 't1',
      agentId: 'a1',
      role: 'user',
      messageId: 'm1',
      text: 'hello',
      createdAt: '2026-01-01T00:00:00Z',
    });
  });

  // ── Recall formatting (AM-REC-1..4) ──────────────────────────────────────
  it('AM-REC-1: empty hits → null (nothing injected)', () => {
    expect(formatRecallBlock([])).toBeNull();
    expect(formatRecallBlock([{ text: '' }, { text: '   ' }])).toBeNull();
  });

  it('AM-REC-2: includes snippet text', () => {
    const block = formatRecallBlock([{ text: 'deadline is March 3' }]);
    expect(block).toContain('deadline is March 3');
  });

  it('AM-REC-3: never emits tool-call frames (Kimi safety)', () => {
    const block = formatRecallBlock([
      { text: 'call dealsAdd to create a deal' },
    ]) as string;
    expect(block).not.toMatch(/tool_calls|<tool_call>|"function"|"arguments"/);
  });

  it('AM-REC-4: filters hits below minScore', () => {
    const hits = [
      { id: 1, score: 0.9, payload: {} },
      { id: 2, score: 0.4, payload: {} },
      { id: 3, score: 0.6, payload: {} },
    ];
    expect(filterHitsByScore(hits, 0.5).map((h) => h.id)).toEqual([1, 3]);
  });

  it('pointIdFor is deterministic, UUID-shaped, tenant-scoped', () => {
    const pointId = pointIdFor('acme', 'm1');
    expect(pointId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
    expect(pointIdFor('acme', 'm1')).toBe(pointId); // deterministic
    expect(pointIdFor('other', 'm1')).not.toBe(pointId); // tenant-scoped
  });
});
