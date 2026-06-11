import { buildDigestBlock, DigestEntry } from '../digest';
import { buildLearningFilter } from '../store';

describe('buildDigestBlock', () => {
  const entry = (overrides: Partial<DigestEntry>): DigestEntry => ({
    _id: 'id',
    statement: 'a lesson',
    type: 'faq',
    ...overrides,
  });

  it('returns null for an empty corpus', () => {
    expect(buildDigestBlock([], { maxChars: 1000, maxEntries: 5 })).toBeNull();
  });

  it('pins win over higher-scored unpinned entries', () => {
    const digest = buildDigestBlock(
      [
        entry({ _id: 'hot', confidence: 1, evidenceCount: 50 }),
        entry({
          _id: 'pinned',
          pinned: true,
          confidence: 0.1,
          evidenceCount: 1,
        }),
      ],
      { maxChars: 1000, maxEntries: 1 },
    );
    expect(digest?.ids).toEqual(['pinned']);
  });

  it('ranks by confidence × evidence', () => {
    const digest = buildDigestBlock(
      [
        entry({ _id: 'weak', confidence: 0.4, evidenceCount: 1 }),
        entry({ _id: 'strong', confidence: 0.9, evidenceCount: 10 }),
      ],
      { maxChars: 1000, maxEntries: 2 },
    );
    expect(digest?.ids[0]).toBe('strong');
  });

  it('respects the character budget', () => {
    const digest = buildDigestBlock(
      [
        entry({ _id: 'a', statement: 'short', confidence: 0.9 }),
        entry({ _id: 'b', statement: 'x'.repeat(5000), confidence: 0.8 }),
      ],
      { maxChars: 300, maxEntries: 10 },
    );
    expect(digest?.ids).toEqual(['a']);
    expect(digest?.block.length ?? 0).toBeLessThanOrEqual(300);
  });

  it('labels entries with their type and carries the no-personal-data caveat', () => {
    const digest = buildDigestBlock(
      [entry({ _id: 'a', type: 'pitfall', statement: 'avoid X' })],
      { maxChars: 1000, maxEntries: 5 },
    );
    expect(digest?.block).toContain('- [pitfall] avoid X');
    expect(digest?.block).toContain('no personal');
  });
});

describe('buildLearningFilter (tenant isolation)', () => {
  it('always scopes to the subdomain', () => {
    const filter = buildLearningFilter({
      subdomain: 'acme',
      statuses: ['approved'],
    });
    expect(filter.must).toContainEqual({
      key: 'subdomain',
      match: { value: 'acme' },
    });
    expect(filter.must).toContainEqual({
      key: 'status',
      match: { any: ['approved'] },
    });
  });

  it('refuses to build a filter without a subdomain (fail-closed)', () => {
    expect(() => buildLearningFilter({ subdomain: '' })).toThrow(
      /tenant isolation/,
    );
  });
});
