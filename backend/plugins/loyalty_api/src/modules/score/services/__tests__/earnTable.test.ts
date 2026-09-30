import { IEarnContext, IEarnTable } from '@/score/@types/earnTable';
import {
  evaluateEarnTable,
  explainEmptyEarn,
  normalizeEarnTable,
  previewEarnTable,
} from '@/score/services/earnTable';

// 1 point per 1,000 of money; tiers earn ×1 / ×2 / ×3.
const table: IEarnTable = {
  amountSource: 'paid',
  rounding: 'floor',
  rows: [
    {
      key: 'big',
      name: 'Big purchase',
      kind: 'base',
      valueType: 'multiplier',
      conditions: { minAmount: 1000000 },
      values: { gold: { value: 4 } },
    },
    {
      key: 'purchase',
      name: 'Purchase',
      kind: 'base',
      valueType: 'multiplier',
      conditions: {},
      values: { none: { value: 1 }, silver: { value: 2 }, gold: { value: 3 } },
    },
    {
      key: 'welcome',
      name: 'Welcome',
      kind: 'bonus',
      valueType: 'percent',
      conditions: { firstPurchase: true },
      values: { all: { value: 10 } },
      cap: 50,
    },
    {
      key: 'bundle',
      name: 'Bundle',
      kind: 'bonus',
      valueType: 'percent',
      conditions: { products: { productIds: 'bundle-a' } },
      values: { none: { value: 5 }, silver: { value: 5 }, gold: { value: 8 } },
    },
    {
      key: 'tier-gift',
      name: 'Tier gift',
      kind: 'bonus',
      valueType: 'fixed',
      conditions: {},
      values: { all: { value: 100 } },
    },
    {
      key: 'bf',
      name: 'Black Friday',
      kind: 'bonus',
      valueType: 'multiplier',
      conditions: {},
      values: { none: { value: 2 }, silver: { value: 2 }, gold: { value: 3 } },
      cap: 500,
    },
    {
      key: 'bf-small',
      name: 'Small multiplier',
      kind: 'bonus',
      valueType: 'multiplier',
      conditions: {},
      values: { all: { value: 1.5 } },
    },
  ],
};

const ctx = (overrides: Partial<IEarnContext> = {}): IEarnContext => ({
  ratio: 1000,
  tier: null,
  totalAmount: 100000,
  paidAmount: 100000,
  scopedAmounts: {},
  firstPurchase: false,
  ...overrides,
});

const pointsOf = (result: ReturnType<typeof evaluateEarnTable>) =>
  Object.fromEntries(
    result.breakdown.map(({ rowKey, points }) => [rowKey, points]),
  );

describe('evaluateEarnTable', () => {
  it('reads only the owner column; an empty cell earns nothing', () => {
    const active = ['purchase'];

    expect(
      evaluateEarnTable({ table, ctx: ctx(), activeRowKeys: active }).total,
    ).toBe(100);
    expect(
      evaluateEarnTable({
        table,
        ctx: ctx({ tier: 'silver' }),
        activeRowKeys: active,
      }).total,
    ).toBe(200);
    expect(
      evaluateEarnTable({
        table,
        ctx: ctx({ tier: 'bronze' }),
        activeRowKeys: active,
      }),
    ).toEqual({ total: 0, breakdown: [] });
  });

  it('earns from the first matching base row only', () => {
    const result = evaluateEarnTable({
      table,
      ctx: ctx({ tier: 'gold', totalAmount: 1000000, paidAmount: 1000000 }),
      activeRowKeys: ['big', 'purchase'],
    });

    expect(pointsOf(result)).toEqual({ big: 4000 });
  });

  it('skips a base row whose tier has no value', () => {
    const result = evaluateEarnTable({
      table,
      ctx: ctx({ tier: 'silver', totalAmount: 1000000, paidAmount: 1000000 }),
      activeRowKeys: ['big', 'purchase'],
    });

    expect(pointsOf(result)).toEqual({ purchase: 2000 });
  });

  it('adds each × base bonus on top of the base, capped', () => {
    const result = evaluateEarnTable({
      table,
      ctx: ctx({
        tier: 'gold',
        totalAmount: 1000000,
        paidAmount: 1000000,
        scopedAmounts: { bundle: 1000000 },
      }),
      activeRowKeys: ['purchase', 'bundle', 'bf', 'bf-small'],
    });

    // bf: 3000 × (3 − 1) capped at 500; bf-small: 3000 × 0.5.
    expect(pointsOf(result)).toEqual({
      purchase: 3000,
      bf: 500,
      'bf-small': 1500,
      bundle: 80,
    });
    expect(result.total).toBe(5080);
  });

  it('adds percent bonuses through the rate and fixed bonuses as points', () => {
    const first = evaluateEarnTable({
      table,
      ctx: ctx({ firstPurchase: true, scopedAmounts: { bundle: 40000 } }),
      activeRowKeys: ['purchase', 'welcome', 'bundle', 'tier-gift'],
    });

    expect(pointsOf(first)).toEqual({
      purchase: 100,
      welcome: 10,
      bundle: 2,
      'tier-gift': 100,
    });

    const repeat = evaluateEarnTable({
      table,
      ctx: ctx(),
      activeRowKeys: ['purchase', 'welcome', 'bundle'],
    });

    expect(pointsOf(repeat)).toEqual({ purchase: 100 });
  });

  it('scales a product row by the paid share and rounds the total down', () => {
    const result = evaluateEarnTable({
      table,
      ctx: ctx({
        totalAmount: 100000,
        paidAmount: 50001,
        scopedAmounts: { bundle: 60000 },
      }),
      activeRowKeys: ['bundle'],
    });

    expect(result.breakdown[0].points).toBeCloseTo(1.50003);
    expect(result.total).toBe(1);
  });

  it('reads a base row as a percent of the amount or a multiplier of its points', () => {
    const baseRow = (valueType: 'percent' | 'multiplier') => ({
      ...table,
      rounding: 'none' as const,
      rows: [
        {
          key: 'base',
          name: 'Base',
          kind: 'base' as const,
          valueType,
          conditions: {},
          values: { all: { value: 1.5 } },
        },
      ],
    });

    // 1.5% of 100,000 is 1,500 in money: 1.5 points at 1,000 a point.
    expect(
      evaluateEarnTable({ table: baseRow('percent'), ctx: ctx() }).total,
    ).toBe(1.5);
    // 100 points at that rate, times 1.5.
    expect(
      evaluateEarnTable({ table: baseRow('multiplier'), ctx: ctx() }).total,
    ).toBe(150);
  });

  it('turns off rows the caller did not select', () => {
    const result = evaluateEarnTable({ table, ctx: ctx(), activeRowKeys: [] });

    expect(result).toEqual({ total: 0, breakdown: [] });
  });
});

describe('previewEarnTable', () => {
  it('shows each tier for a plain purchase and skips unfinished rows', () => {
    const preview = previewEarnTable({
      table: {
        ...table,
        rows: [
          ...table.rows,
          {
            key: '',
            name: '',
            kind: 'bonus',
            valueType: 'percent',
            conditions: {},
            values: {},
          },
        ],
      },
      amount: 100000,
      ratio: 1000,
      tiers: [
        { key: 'silver', name: 'Silver' },
        { key: 'gold', name: 'Gold' },
      ],
    });

    // base + tier gift + both × base bonuses (bf capped at 500 for gold).
    expect(preview.map(({ tierName, total }) => [tierName, total])).toEqual([
      [null, 350],
      ['Silver', 600],
      ['Gold', 1050],
    ]);
  });
});

describe('normalizeEarnTable', () => {
  it('gives an "all" row to every tier', () => {
    const result = evaluateEarnTable({
      table,
      ctx: ctx({ tier: 'bronze', firstPurchase: true }),
      activeRowKeys: ['welcome'],
    });

    expect(result.total).toBe(10);
  });

  it('keeps row keys, fills missing ones and drops empty cells', () => {
    const normalized = normalizeEarnTable({
      amountSource: 'paid',
      rounding: 'none',
      rows: [
        {
          ...table.rows[1],
          values: {
            none: { value: 1 },
            silver: { value: '' as unknown as number },
          },
        },
        { ...table.rows[2], key: '' },
      ],
    });

    expect(normalized.rows[0].key).toBe('purchase');
    expect(normalized.rows[0].values).toEqual({ none: { value: 1 } });
    expect(normalized.rows[1].key).toMatch(/^[a-z0-9]{8}$/);
  });

  it('keeps each kind to its own value types', () => {
    const normalized = normalizeEarnTable({
      ...table,
      rows: [
        { ...table.rows[1], valueType: 'fixed' },
        { ...table.rows[2], valueType: 'multiplier' },
      ],
    });

    expect(normalized.rows.map(({ valueType }) => valueType)).toEqual([
      'multiplier',
      'multiplier',
    ]);
  });

  it('turns a former multiplier row into a bonus multiplying the base', () => {
    const normalized = normalizeEarnTable({
      ...table,
      rows: [
        {
          ...table.rows[5],
          kind: 'multiplier' as unknown as 'bonus',
          valueType: 'percent',
        },
      ],
    });

    expect(normalized.rows[0]).toMatchObject({
      kind: 'bonus',
      valueType: 'multiplier',
    });
  });

  it('rejects a row without any value', () => {
    expect(() =>
      normalizeEarnTable({
        amountSource: 'paid',
        rounding: 'none',
        rows: [{ ...table.rows[1], values: {} }],
      }),
    ).toThrow('enter a value for at least one tier');
  });
});

describe('explainEmptyEarn', () => {
  const noAmount: IEarnContext = {
    ratio: 1000,
    tier: null,
    totalAmount: 0,
    paidAmount: 0,
    scopedAmounts: {},
    firstPurchase: false,
  };

  it('names every reason a customer trigger earns nothing', () => {
    expect(
      explainEmptyEarn({ table, ctx: noAmount, activeRowKeys: ['big'] }),
    ).toEqual([
      { reason: 'no-tier-value', tier: 'none' },
      {
        reason: 'conditions-not-met',
        rows: [{ name: 'Big purchase', unmet: 'minAmount' }],
      },
      { reason: 'no-amount', amountSource: 'paid' },
    ]);
  });

  it('does not blame the amount for fixed points', () => {
    const giftTable: IEarnTable = {
      ...table,
      rows: [
        {
          key: 'gift',
          name: 'Gift',
          kind: 'bonus',
          valueType: 'fixed',
          conditions: { firstPurchase: true },
          values: { all: { value: 100 } },
        },
      ],
    };

    expect(explainEmptyEarn({ table: giftTable, ctx: noAmount })).toEqual([
      {
        reason: 'conditions-not-met',
        rows: [{ name: 'Gift', unmet: 'firstPurchase' }],
      },
    ]);
  });

  it('reports a selection that no longer exists', () => {
    expect(
      explainEmptyEarn({ table, ctx: noAmount, activeRowKeys: ['gone'] }),
    ).toEqual([{ reason: 'no-rows' }]);
  });
});
