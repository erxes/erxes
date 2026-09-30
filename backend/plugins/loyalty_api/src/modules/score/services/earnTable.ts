import {
  IEarnBreakdownItem,
  IEarnConditions,
  IEarnContext,
  IEarnRow,
  IEarnTable,
  IEarnValue,
  TEarnCondition,
  TEarnRowKind,
  TEarnValueType,
  TScoreSkip,
} from '@/score/@types/earnTable';
import { fixScoreNumber } from '@/score/services/scoreLedger';
import { customAlphabet } from 'nanoid';

// `all` makes a row the same for everyone; otherwise each owner reads only
// their own column (`none` for owners without a tier) and an empty cell
// earns nothing.
export const ALL_TIERS = 'all';
export const NO_TIER = 'none';

export const hasProductConditions = (conditions?: IEarnConditions) =>
  Object.values(conditions?.products || {}).some(
    (value) => typeof value === 'string' && !!value.trim(),
  );

const baseAmount = (table: IEarnTable, ctx: IEarnContext) =>
  table.amountSource === 'total' ? ctx.totalAmount : ctx.paidAmount;

// A row limited to some products counts only their share of the base amount.
const rowAmount = (table: IEarnTable, row: IEarnRow, ctx: IEarnContext) => {
  const amount = baseAmount(table, ctx);

  if (!hasProductConditions(row.conditions)) {
    return amount;
  }

  const scoped = ctx.scopedAmounts[row.key] || 0;

  return ctx.totalAmount > 0 ? (amount * scoped) / ctx.totalAmount : 0;
};

const unmetCondition = (
  row: IEarnRow,
  ctx: IEarnContext,
): TEarnCondition | undefined => {
  const { minAmount, maxAmount, firstPurchase, sources } = row.conditions || {};
  const amount = ctx.totalAmount;

  if (minAmount !== undefined && minAmount !== null && amount < minAmount) {
    return 'minAmount';
  }

  if (maxAmount !== undefined && maxAmount !== null && amount > maxAmount) {
    return 'maxAmount';
  }

  if (firstPurchase && !ctx.firstPurchase) {
    return 'firstPurchase';
  }

  if (sources?.length && (!ctx.source || !sources.includes(ctx.source))) {
    return 'sources';
  }

  if (hasProductConditions(row.conditions) && !ctx.scopedAmounts[row.key]) {
    return 'products';
  }

  return undefined;
};

const matches = (row: IEarnRow, ctx: IEarnContext) => !unmetCondition(row, ctx);

// An empty tier cell falls back to the "all tiers" column.
const valueFor = (
  row: IEarnRow,
  tier?: string | null,
): IEarnValue | undefined => {
  const all = row.values?.[ALL_TIERS];

  if (all && Number.isFinite(all.value)) {
    return all;
  }

  const own = row.values?.[tier || NO_TIER];

  return own && Number.isFinite(own.value) ? own : undefined;
};

// Rules count money; the account type's rate turns it into points.
const points = (
  row: IEarnRow,
  value: IEarnValue,
  amount: number,
  ratio: number,
) => {
  if (row.kind === 'bonus' && row.valueType === 'fixed') {
    return value.value;
  }

  const money =
    row.valueType === 'multiplier'
      ? amount * value.value
      : (amount * value.value) / 100;

  return money / (ratio > 0 ? ratio : 1);
};

const capped = (value: number, cap?: number) =>
  cap !== undefined && cap !== null && cap >= 0 ? Math.min(value, cap) : value;

const round = (value: number, rounding: IEarnTable['rounding']) => {
  if (rounding === 'floor') {
    return Math.floor(value);
  }

  if (rounding === 'round') {
    return Math.round(value);
  }

  return fixScoreNumber(value);
};

// The first matching base row earns; every matching bonus adds on top.
export const evaluateEarnTable = ({
  table,
  ctx,
  activeRowKeys,
}: {
  table: IEarnTable;
  ctx: IEarnContext;
  activeRowKeys?: string[];
}) => {
  const matched = (table.rows || [])
    .filter((row) => !activeRowKeys || activeRowKeys.includes(row.key))
    .map((row) => ({ row, value: valueFor(row, ctx.tier) }))
    .filter(
      (item): item is { row: IEarnRow; value: IEarnValue } =>
        !!item.value && matches(item.row, ctx),
    );

  const breakdown: IEarnBreakdownItem[] = [];
  const base = matched.find(({ row }) => row.kind === 'base');
  const basePoints = base
    ? points(base.row, base.value, rowAmount(table, base.row, ctx), ctx.ratio)
    : 0;

  if (base) {
    breakdown.push({
      rowKey: base.row.key,
      name: base.row.name,
      points: basePoints,
    });
  }

  for (const { row, value } of matched.filter(
    ({ row }) => row.kind === 'bonus',
  )) {
    // ×N on the base: the base already gave one of the N.
    const earned =
      row.valueType === 'multiplier'
        ? basePoints * Math.max(value.value - 1, 0)
        : points(row, value, rowAmount(table, row, ctx), ctx.ratio);

    breakdown.push({
      rowKey: row.key,
      name: row.name,
      points: capped(earned, row.cap),
    });
  }

  const total = round(
    breakdown.reduce((sum, item) => sum + item.points, 0),
    table.rounding,
  );

  return {
    total,
    breakdown: breakdown.map((item) => ({
      ...item,
      points: fixScoreNumber(item.points),
    })),
  };
};

const needsAmount = (row: IEarnRow) =>
  !(row.kind === 'bonus' && row.valueType === 'fixed');

/**
 * Every reason a table earned nothing, not only the first: fixing one and
 * meeting the next would read as the same unexplained zero.
 */
export const explainEmptyEarn = ({
  table,
  ctx,
  activeRowKeys,
}: {
  table: IEarnTable;
  ctx: IEarnContext;
  activeRowKeys?: string[];
}): TScoreSkip[] => {
  const selected = (table.rows || []).filter(
    (row) => !activeRowKeys || activeRowKeys.includes(row.key),
  );

  if (!selected.length) {
    return [{ reason: 'no-rows' }];
  }

  const skips: TScoreSkip[] = [];
  const valued = selected.filter((row) => valueFor(row, ctx.tier));

  if (!valued.length) {
    skips.push({ reason: 'no-tier-value', tier: ctx.tier || NO_TIER });
  }

  const candidates = valued.length ? valued : selected;
  const unmet = candidates
    .map((row) => ({ name: row.name, unmet: unmetCondition(row, ctx) }))
    .filter(
      (item): item is { name: string; unmet: TEarnCondition } => !!item.unmet,
    );

  if (unmet.length === candidates.length) {
    skips.push({ reason: 'conditions-not-met', rows: unmet });
  }

  if (candidates.every(needsAmount) && !baseAmount(table, ctx)) {
    skips.push({ reason: 'no-amount', amountSource: table.amountSource });
  }

  return skips.length ? skips : [{ reason: 'rounded-to-zero' }];
};

const generateRowKey = customAlphabet(
  'abcdefghijklmnopqrstuvwxyz0123456789',
  8,
);

const ROW_KINDS: TEarnRowKind[] = ['base', 'bonus'];
// What each kind of row may be, first being the default.
const VALUE_TYPES: Record<TEarnRowKind, TEarnValueType[]> = {
  base: ['multiplier', 'percent'],
  bonus: ['percent', 'fixed', 'multiplier'],
};

const optionalNumber = (value: unknown) => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : undefined;
};

// Keys stay with their row across edits: automations select rows by key.
export const normalizeEarnTable = (table: IEarnTable): IEarnTable => {
  const keys = new Set<string>();

  return {
    amountSource: table?.amountSource === 'total' ? 'total' : 'paid',
    rounding: ['floor', 'round'].includes(table?.rounding)
      ? table.rounding
      : 'none',
    rows: (table?.rows || []).map((row) => {
      const name = String(row?.name || '').trim();

      if (!name) {
        throw new Error('Every earning row needs a name');
      }

      // Multiplier rows became bonus rows that multiply the base.
      const legacyMultiplier = (row.kind as string) === 'multiplier';
      const kind: TEarnRowKind = legacyMultiplier ? 'bonus' : row.kind;

      if (!ROW_KINDS.includes(kind)) {
        throw new Error(`${name}: unknown row type`);
      }

      const key =
        row.key && !keys.has(row.key) ? String(row.key) : generateRowKey();
      keys.add(key);

      const values: Record<string, IEarnValue> = {};

      for (const [tier, cell] of Object.entries(row.values || {})) {
        const value = optionalNumber(cell?.value);

        if (value !== undefined) {
          values[tier] = { value };
        }
      }

      if (!Object.keys(values).length) {
        throw new Error(`${name}: enter a value for at least one tier`);
      }

      const allowed = VALUE_TYPES[kind];
      const valueType = legacyMultiplier
        ? 'multiplier'
        : allowed.includes(row.valueType)
        ? row.valueType
        : allowed[0];

      const conditions = row.conditions || {};

      return {
        key,
        name,
        kind,
        valueType,
        values,
        cap: optionalNumber(row.cap),
        conditions: {
          minAmount: optionalNumber(conditions.minAmount),
          maxAmount: optionalNumber(conditions.maxAmount),
          firstPurchase: !!conditions.firstPurchase,
          sources: (conditions.sources || []).filter(Boolean),
          products: conditions.products,
        },
      };
    }),
  };
};

// What a plain purchase of `amount` earns for each tier, while the table is
// still being edited: unnamed or empty rows are skipped rather than rejected,
// and rows that need products, a first purchase or a source do not apply.
export const previewEarnTable = ({
  table,
  amount,
  ratio,
  tiers,
}: {
  table: IEarnTable;
  amount: number;
  ratio: number;
  tiers: { key: string; name: string }[];
}) => {
  const rows = (table?.rows || [])
    .filter((row) => Object.keys(row?.values || {}).length)
    .map((row, index) => ({
      ...row,
      name: row.name || '—',
      key: row.key || `row${index}`,
    }));
  const normalized = normalizeEarnTable({ ...table, rows });

  return [{ key: null, name: null }, ...tiers].map(({ key, name }) => ({
    tierKey: key,
    tierName: name,
    ...evaluateEarnTable({
      table: normalized,
      ctx: {
        ratio,
        tier: key,
        totalAmount: amount,
        paidAmount: amount,
        scopedAmounts: {},
        firstPurchase: false,
      },
    }),
  }));
};
