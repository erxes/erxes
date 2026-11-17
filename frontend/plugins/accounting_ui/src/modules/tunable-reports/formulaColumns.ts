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
  from_row: 'min-w-[1100px]',
  ratio: 'min-w-[1460px]',
};
interface FormulaColumn {
  key: string;
  label: string;
  className: string;
}
const columnWidth = (key: string): string => {
  if (key === 'source' || key === 'ratioSource')
    return 'w-80 whitespace-normal';
  if (key.endsWith('AccountId') || key.endsWith('CategoryId'))
    return 'w-48 whitespace-normal';
  return key === 'percent'
    ? 'w-44 whitespace-normal'
    : 'w-36 whitespace-normal';
};
export const getFormulaColumns = (
  kind: FormulaKind,
  t: TFunction,
): FormulaColumn[] => {
  const accountHeaders =
    kind === 'balance' || kind === 'transaction'
      ? ACCOUNT_FIELDS[kind].map(({ field, label }) => ({
          key: field,
          label: kind === 'balance' ? t(label, { keyPrefix: '' }) : t(label),
        }))
      : [{ key: 'source', label: t('source') }];
  const headers: Omit<FormulaColumn, 'className'>[] = [
    ...accountHeaders,
    ...(kind === 'ratio'
      ? [
          { key: 'ratioSource', label: t('ratioSource') },
          { key: 'ratioRule', label: t('operation') },
        ]
      : []),
    { key: 'percent', label: t('percent') },
    { key: 'plusOrMinus', label: t('operation') },
    ...(kind === 'transaction'
      ? [{ key: 'valueSide', label: t('valueSide') }]
      : []),
    { key: 'getDate', label: t('period') },
    { key: 'isPre', label: t('comparison') },
  ];

  return headers.map((column) => ({
    ...column,
    className: columnWidth(column.key),
  }));
};
