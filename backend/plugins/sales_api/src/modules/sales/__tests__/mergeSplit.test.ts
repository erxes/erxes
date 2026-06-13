import {
  collectAllocatedLineIds,
  mergeProductsData,
  removeSplitProductsData,
  selectSplitProductsData,
  unionIds,
  validateMergeInput,
  validateSplitInput,
} from '../mergeSplit';

import { IProductData } from '../@types';

const pd = (over: Partial<IProductData> = {}): IProductData => ({
  _id: Math.random().toString(),
  productId: 'p1',
  uom: 'pcs',
  currency: 'MNT',
  quantity: 1,
  unitPrice: 100,
  globalUnitPrice: 100,
  unitPricePercent: 100,
  amount: 100,
  ...over,
});

describe('validateMergeInput', () => {
  it('returns the single source id', () => {
    expect(validateMergeInput(['a'], 't')).toEqual(['a']);
  });

  it('collapses a duplicated single source', () => {
    expect(validateMergeInput(['a', 'a'], 't')).toEqual(['a']);
  });

  it('throws when target missing', () => {
    expect(() => validateMergeInput(['a'], '')).toThrow(
      'Target deal is required',
    );
  });

  it('throws when no sources', () => {
    expect(() => validateMergeInput([], 't')).toThrow(
      'A source deal is required',
    );
  });

  it('throws when source overlaps target', () => {
    expect(() => validateMergeInput(['a', 't'], 't')).toThrow(
      'Source and target deals cannot overlap',
    );
  });

  it('throws when more than one source (only two deals allowed)', () => {
    expect(() => validateMergeInput(['a', 'b'], 't')).toThrow(
      'Only two deals can be merged at a time',
    );
  });
});

describe('mergeProductsData', () => {
  it('sums quantity & amount for the same product line', () => {
    const target = [pd({ productId: 'p1', quantity: 2, amount: 200 })];
    const source = [pd({ productId: 'p1', quantity: 3, amount: 300 })];

    const merged = mergeProductsData(target, [source]);

    expect(merged).toHaveLength(1);
    expect(merged[0].quantity).toBe(5);
    expect(merged[0].amount).toBe(500);
  });

  it('keeps distinct products as separate lines', () => {
    const target = [pd({ productId: 'p1' })];
    const source = [pd({ productId: 'p2' })];

    const merged = mergeProductsData(target, [source]);

    expect(merged.map((m) => m.productId).sort()).toEqual(['p1', 'p2']);
  });

  it('treats different uom/currency as distinct lines', () => {
    const target = [pd({ productId: 'p1', uom: 'pcs' })];
    const source = [pd({ productId: 'p1', uom: 'box' })];

    expect(mergeProductsData(target, [source])).toHaveLength(2);
  });

  it('keeps the target product lines when source has none', () => {
    const target = [pd({ productId: 'p1' }), pd({ productId: 'p2' })];

    expect(mergeProductsData(target, [[]])).toHaveLength(2);
  });

  it('skips lines without productId', () => {
    const merged = mergeProductsData([], [[pd({ productId: '' })]]);
    expect(merged).toHaveLength(0);
  });
});

describe('unionIds', () => {
  it('dedupes preserving order and dropping falsy', () => {
    expect(unionIds(['a', 'b'], ['b', 'c'], [undefined, ''])).toEqual([
      'a',
      'b',
      'c',
    ]);
  });
});

describe('validateSplitInput', () => {
  const source = [pd({ _id: 'l1' }), pd({ _id: 'l2' })];

  it('passes for valid product ids', () => {
    expect(() =>
      validateSplitInput([{ productIds: ['l1'] }], source),
    ).not.toThrow();
  });

  it('throws when no splits', () => {
    expect(() => validateSplitInput([], source)).toThrow(
      'At least one split is required',
    );
  });

  it('throws when product line not on source', () => {
    expect(() =>
      validateSplitInput([{ productIds: ['nope'] }], source),
    ).toThrow('does not belong to the source deal');
  });

  it('throws on negative amount', () => {
    expect(() => validateSplitInput([{ amount: -5 }], source)).toThrow(
      'Split amount cannot be negative',
    );
  });
});

describe('selectSplitProductsData', () => {
  const source = [
    pd({ _id: 'l1', productId: 'p1' }),
    pd({ _id: 'l2', productId: 'p2' }),
  ];

  it('selects only requested lines', () => {
    const lines = selectSplitProductsData({ productIds: ['l2'] }, source);
    expect(lines).toHaveLength(1);
    expect(lines[0].productId).toBe('p2');
  });

  it('returns empty for amount-only split', () => {
    expect(selectSplitProductsData({ amount: 100 }, source)).toEqual([]);
  });
});

describe('collectAllocatedLineIds', () => {
  it('gathers product ids across all splits', () => {
    const ids = collectAllocatedLineIds([
      { productIds: ['l1', 'l2'] },
      { productIds: ['l2', 'l3'] },
      { amount: 50 },
    ]);
    expect([...ids].sort()).toEqual(['l1', 'l2', 'l3']);
  });
});

describe('removeSplitProductsData', () => {
  const source = [
    pd({ _id: 'l1', productId: 'p1' }),
    pd({ _id: 'l2', productId: 'p2' }),
    pd({ _id: 'l3', productId: 'p3' }),
  ];

  it('removes allocated lines from the original deal', () => {
    const remaining = removeSplitProductsData(source, [
      { productIds: ['l1'] },
      { productIds: ['l3'] },
    ]);
    expect(remaining.map((p) => p._id)).toEqual(['l2']);
  });

  it('keeps all lines when only amount-allocated', () => {
    const remaining = removeSplitProductsData(source, [{ amount: 100 }]);
    expect(remaining).toHaveLength(3);
  });
});
