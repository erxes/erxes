import { TFunction } from 'i18next';
import { ReportFormula } from '@/tunable-reports/schema';

export const FORMULA_KINDS = [
  'balance',
  'transaction',
  'from_row',
  'ratio',
] as const;
export type FormulaKind = ReportFormula['kind'];
export type AccountField =
  | 'debitAccountId'
  | 'creditAccountId'
  | 'debitAccountCategoryId'
  | 'creditAccountCategoryId';
export const ACCOUNT_FIELDS: Record<
  'balance' | 'transaction',
  { field: AccountField; label: string }[]
> = {
  balance: [
    { field: 'debitAccountId', label: 'account' },
    { field: 'debitAccountCategoryId', label: 'account-category' },
  ],
  transaction: [
    { field: 'debitAccountId', label: 'debitAccount' },
    { field: 'debitAccountCategoryId', label: 'debitCategory' },
    { field: 'creditAccountId', label: 'creditAccount' },
    { field: 'creditAccountCategoryId', label: 'creditCategory' },
  ],
};

export const FORMULA_TABLE_WIDTHS: Record<FormulaKind, string> = {
  balance: 'min-w-[1020px]',
  transaction: 'min-w-[1500px]',
  from_row: 'min-w-[1360px]',
  ratio: 'min-w-[2210px]',
};
export const REFERENCE_FIELDS = [
  { field: 'reportId', label: 'referenceReport', className: 'w-44' },
  { field: 'sectionId', label: 'referenceSection', className: 'w-36' },
  { field: 'rowId', label: 'referenceRow', className: 'w-52' },
  { field: 'columnId', label: 'referenceColumn', className: 'w-44' },
] as const;
interface FormulaColumn {
  key: string;
  label: string;
  className: string;
  group?: { key: string; label: string };
}
export interface FormulaHeaderGroup {
  key: string;
  label: string;
  span: number;
}
const columnWidth = (key: string): string => {
  if (key.endsWith('AccountId') || key.endsWith('CategoryId'))
    return 'w-48 whitespace-normal';
  return key === 'percent'
    ? 'w-44 whitespace-normal'
    : 'w-36 whitespace-normal';
};
const referenceColumns = (
  operand: 'source' | 'ratioSource',
  t: TFunction,
): FormulaColumn[] =>
  REFERENCE_FIELDS.map(({ field, label, className }) => ({
    key: `${operand}.${field}`,
    label: t(label),
    className: `${className} whitespace-normal`,
    group: { key: operand, label: t(operand) },
  }));
export const getFormulaColumns = (
  kind: FormulaKind,
  t: TFunction,
): FormulaColumn[] => {
  const head = (key: string, label: string): FormulaColumn => ({
    key,
    label,
    className: columnWidth(key),
  });
  const leading =
    kind === 'balance' || kind === 'transaction'
      ? ACCOUNT_FIELDS[kind].map(({ field, label }) =>
          head(
            field,
            kind === 'balance' ? t(label, { keyPrefix: '' }) : t(label),
          ),
        )
      : referenceColumns('source', t);
  return [
    ...leading,
    ...(kind === 'ratio'
      ? [
          ...referenceColumns('ratioSource', t),
          head('ratioRule', t('operation')),
        ]
      : []),
    head('percent', t('percent')),
    head('plusOrMinus', t('operation')),
    ...(kind === 'transaction' ? [head('valueSide', t('valueSide'))] : []),
    head('getDate', t('period')),
    head('isPre', t('comparison')),
  ];
};
export const getFormulaHeaderGroups = (
  columns: FormulaColumn[],
): (FormulaColumn | FormulaHeaderGroup)[] =>
  columns.reduce<(FormulaColumn | FormulaHeaderGroup)[]>((items, column) => {
    const last = items[items.length - 1];
    if (!column.group) return [...items, column];
    if (last && 'span' in last && last.key === column.group.key) {
      return [...items.slice(0, -1), { ...last, span: last.span + 1 }];
    }
    return [...items, { ...column.group, span: 1 }];
  }, []);
