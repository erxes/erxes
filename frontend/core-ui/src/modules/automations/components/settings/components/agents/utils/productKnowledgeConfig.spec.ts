import { TAiKnowledgeSourceIndexStatus } from 'ui-modules';
import {
  indexedProductCount,
  indexProgressOf,
  normalizeProductKnowledgeConfig,
  toArrayValue,
} from './productKnowledgeConfig';

const status = (sourceId: string, state: string, extra = {}) =>
  ({ sourceId, status: state, ...extra } as TAiKnowledgeSourceIndexStatus);

describe('normalizeProductKnowledgeConfig', () => {
  it('reads the legacy lists as the include lists', () => {
    expect(
      normalizeProductKnowledgeConfig({
        categoryIds: ['c1'],
        productIds: ['p1', 2],
      }),
    ).toEqual({
      includeCategoryIds: ['c1'],
      includeProductIds: ['p1'],
      excludeCategoryIds: [],
      excludeProductIds: [],
    });
  });

  it('falls back to the chosen products when nothing is stored', () => {
    expect(
      normalizeProductKnowledgeConfig({}, ['p9']).includeProductIds,
    ).toEqual(['p9']);
  });

  it('keeps a stored empty include list empty', () => {
    expect(
      normalizeProductKnowledgeConfig({ includeProductIds: [] }, ['p9'])
        .includeProductIds,
    ).toEqual([]);
  });
});

describe('index status', () => {
  const statuses = [
    status('p1', 'indexed'),
    status('p2', 'failed'),
    status('__scope_run__:1', 'indexing', {
      processedCount: 3,
      totalCount: 10,
    }),
  ];

  it('counts indexed products, not the run row', () => {
    expect(indexedProductCount(statuses)).toBe(1);
  });

  it('reports a running index job', () => {
    expect(indexProgressOf(statuses)).toEqual({ processed: 3, total: 10 });
    expect(indexProgressOf([status('__scope_run__:1', 'indexed')])).toBeNull();
  });

  it('turns a single pick into a list', () => {
    expect(toArrayValue('a')).toEqual(['a']);
    expect(toArrayValue('')).toEqual([]);
  });
});
