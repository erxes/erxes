import {
  EarnRowFormValues,
  EarnTableFormValues,
  LoyaltyScoreFormValues,
} from '../constants/formSchema';
import {
  EARN_ALL_TIERS,
  earnValueTypeFor,
  IEarnTableInput,
} from '../types/earnTable';

type TAddForm = NonNullable<LoyaltyScoreFormValues['add']>;

type TAddInput = { table?: IEarnTableInput };

const toNumber = (value?: string) =>
  value === undefined || value === '' || Number.isNaN(Number(value))
    ? undefined
    : Number(value);

const toIds = (value?: string) =>
  (value || '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

const joinIds = (ids?: string[]) => (ids?.length ? ids.join(',') : undefined);

// Base rows start at 1% of the amount; a bonus waits for its value.
const DEFAULT_ALL_VALUE: Record<EarnRowFormValues['kind'], string> = {
  base: '1',
  bonus: '',
};

export const emptyEarnRow = (
  kind: EarnRowFormValues['kind'] = 'base',
): EarnRowFormValues => ({
  name: '',
  kind,
  valueType: earnValueTypeFor(kind),
  scope: 'all',
  values: { [EARN_ALL_TIERS]: DEFAULT_ALL_VALUE[kind] },
  conditions: {},
});

export const defaultEarnTable = (): EarnTableFormValues => ({
  amountSource: 'paid',
  rounding: 'floor',
  rows: [emptyEarnRow('base')],
});

export const toAddInput = ({ table }: TAddForm): TAddInput => ({
  table: {
    amountSource: table.amountSource,
    rounding: table.rounding,
    rows: table.rows.map((row) => {
      const values: IEarnTableInput['rows'][number]['values'] = {};

      // Only the cells of the chosen scope are kept.
      for (const [tier, raw] of Object.entries(row.values || {})) {
        const value = toNumber(raw);

        if (
          value !== undefined &&
          (row.scope === 'all') === (tier === EARN_ALL_TIERS)
        ) {
          values[tier] = { value };
        }
      }

      return {
        key: row.key || undefined,
        name: row.name.trim(),
        kind: row.kind,
        valueType: earnValueTypeFor(row.kind, row.valueType),
        cap: toNumber(row.cap),
        values,
        conditions: {
          minAmount: toNumber(row.conditions.minAmount),
          maxAmount: toNumber(row.conditions.maxAmount),
          firstPurchase: !!row.conditions.firstPurchase,
          sources: row.conditions.sources || [],
          products: {
            productCategoryIds: joinIds(row.conditions.productCategoryIds),
            productIds: joinIds(row.conditions.productIds),
            tagIds: joinIds(row.conditions.tagIds),
          },
        },
      };
    }),
  },
});

const cell = (value?: number) =>
  value === undefined || value === null ? '' : String(value);

export const fromAddInput = (add?: TAddInput | null): TAddForm => ({
  table: add?.table
    ? {
        amountSource: add.table.amountSource || 'paid',
        rounding: add.table.rounding || 'none',
        rows: (add.table.rows || []).map((row) => ({
          key: row.key,
          name: row.name,
          // Multiplier rows became bonus rows that multiply the base.
          kind: (row.kind as string) === 'multiplier' ? 'bonus' : row.kind,
          valueType:
            (row.kind as string) === 'multiplier'
              ? 'multiplier'
              : earnValueTypeFor(row.kind, row.valueType),
          scope: row.values?.[EARN_ALL_TIERS] ? 'all' : 'tiers',
          cap: cell(row.cap),
          values: Object.fromEntries(
            Object.entries(row.values || {}).map(([tier, value]) => [
              tier,
              cell(value?.value),
            ]),
          ),
          conditions: {
            minAmount: cell(row.conditions?.minAmount),
            maxAmount: cell(row.conditions?.maxAmount),
            firstPurchase: !!row.conditions?.firstPurchase,
            sources: row.conditions?.sources || [],
            productCategoryIds: toIds(
              row.conditions?.products?.productCategoryIds,
            ),
            productIds: toIds(row.conditions?.products?.productIds),
            tagIds: toIds(row.conditions?.products?.tagIds),
          },
        })),
      }
    : defaultEarnTable(),
});
