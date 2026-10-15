import {
  EarnRowFormValues,
  EarnTableFormValues,
  LoyaltyScoreFormValues,
} from '../constants/formSchema';
import { isRecord } from '@/loyalties/utils/isRecord';
import {
  EARN_ALL_TIERS,
  earnValueTypeFor,
  IEarnTableInput,
  TEarnRowKind,
  TEarnValueType,
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

type TEarnRowInput = IEarnTableInput['rows'][number];

const VALUE_TYPES: TEarnValueType[] = ['percent', 'fixed', 'multiplier'];

const optionalNumber = (value: unknown) =>
  typeof value === 'number' ? value : undefined;

const optionalString = (value: unknown) =>
  typeof value === 'string' ? value : undefined;

const parseValues = (value: unknown): TEarnRowInput['values'] => {
  const values: TEarnRowInput['values'] = {};

  if (!isRecord(value)) {
    return values;
  }

  for (const [tier, tierValue] of Object.entries(value)) {
    if (isRecord(tierValue) && typeof tierValue.value === 'number') {
      values[tier] = { value: tierValue.value };
    }
  }

  return values;
};

const parseEarnRow = (value: unknown): TEarnRowInput[] => {
  if (!isRecord(value)) {
    return [];
  }

  // Multiplier rows became bonus rows that multiply the base.
  const isLegacyMultiplier = value.kind === 'multiplier';
  const kind: TEarnRowKind =
    value.kind === 'bonus' || isLegacyMultiplier ? 'bonus' : 'base';
  const conditions = isRecord(value.conditions) ? value.conditions : {};
  const products = isRecord(conditions.products) ? conditions.products : {};

  return [
    {
      key: optionalString(value.key),
      name: optionalString(value.name) ?? '',
      kind,
      valueType: isLegacyMultiplier
        ? 'multiplier'
        : earnValueTypeFor(
            kind,
            VALUE_TYPES.find((valueType) => valueType === value.valueType),
          ),
      cap: optionalNumber(value.cap),
      values: parseValues(value.values),
      conditions: {
        minAmount: optionalNumber(conditions.minAmount),
        maxAmount: optionalNumber(conditions.maxAmount),
        firstPurchase: conditions.firstPurchase === true,
        sources: Array.isArray(conditions.sources)
          ? conditions.sources.filter(
              (source): source is string => typeof source === 'string',
            )
          : [],
        products: {
          productCategoryIds: optionalString(products.productCategoryIds),
          productIds: optionalString(products.productIds),
          tagIds: optionalString(products.tagIds),
        },
      },
    },
  ];
};

export const parseEarnTable = (value: unknown): IEarnTableInput | undefined => {
  if (!isRecord(value) || !isRecord(value.table)) {
    return undefined;
  }

  const { table } = value;

  return {
    amountSource: table.amountSource === 'total' ? 'total' : 'paid',
    rounding:
      table.rounding === 'floor' || table.rounding === 'round'
        ? table.rounding
        : 'none',
    rows: Array.isArray(table.rows) ? table.rows.flatMap(parseEarnRow) : [],
  };
};

export const fromAddInput = (add?: unknown): TAddForm => {
  const table = parseEarnTable(add);

  return {
    table: table
      ? {
          amountSource: table.amountSource,
          rounding: table.rounding,
          rows: table.rows.map((row) => ({
            key: row.key,
            name: row.name,
            kind: row.kind,
            valueType: row.valueType,
            scope: row.values[EARN_ALL_TIERS] ? 'all' : 'tiers',
            cap: cell(row.cap),
            values: Object.fromEntries(
              Object.entries(row.values).map(([tier, value]) => [
                tier,
                cell(value.value),
              ]),
            ),
            conditions: {
              minAmount: cell(row.conditions.minAmount),
              maxAmount: cell(row.conditions.maxAmount),
              firstPurchase: !!row.conditions.firstPurchase,
              sources: row.conditions.sources || [],
              productCategoryIds: toIds(
                row.conditions.products?.productCategoryIds,
              ),
              productIds: toIds(row.conditions.products?.productIds),
              tagIds: toIds(row.conditions.products?.tagIds),
            },
          })),
        }
      : defaultEarnTable(),
  };
};
