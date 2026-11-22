import { JOURNALS, TR_FOLLOW_TYPES, TR_SIDES } from '../../@types/constants';
import { ITaxRowLedgerFormula } from '../../@types/taxRow';
import { calculateTaxRowValues, normalizeTaxRowNumber } from './formula';

export const TAX_REPORT_KINDS = ['vat', 'ctax'] as const;

export type TaxReportKind = (typeof TAX_REPORT_KINDS)[number];

type TrSide = 'dt' | 'ct';

// Journals whose saved amount excludes tax and whose tax entry lands on the
// same side (see the TaxTrs callers in commonSave). Every other taxed journal
// posts a tax-inclusive amount and books tax on the opposite side.
const SAME_SIDE_TAX_JOURNALS = new Set<string>([
  JOURNALS.INV_INCOME,
  JOURNALS.INV_SALE,
  JOURNALS.INV_SALE_RETURN,
  JOURNALS.FXA_INCOME,
  JOURNALS.FXA_SALE,
]);

interface ITaxKindConfig {
  followType: string;
  otherFollowType: string;
  excludeField: 'excludeVat' | 'excludeCtax';
  otherExcludeField: 'excludeVat' | 'excludeCtax';
  // Kinds reported at the standard rate on the net amount, like Erkhet does
  // for its hidden and exempt VAT lines.
  valueRatedKinds: Set<string>;
  defaultStandardPercent: number;
}

export const TAX_KIND_CONFIGS: Record<TaxReportKind, ITaxKindConfig> = {
  vat: {
    followType: TR_FOLLOW_TYPES.VAT,
    otherFollowType: TR_FOLLOW_TYPES.CTAX,
    excludeField: 'excludeVat',
    otherExcludeField: 'excludeCtax',
    valueRatedKinds: new Set(['hidden', 'free']),
    defaultStandardPercent: 10,
  },
  ctax: {
    followType: TR_FOLLOW_TYPES.CTAX,
    otherFollowType: TR_FOLLOW_TYPES.VAT,
    excludeField: 'excludeCtax',
    otherExcludeField: 'excludeVat',
    valueRatedKinds: new Set(['hidden']),
    defaultStandardPercent: 2,
  },
};

interface ITaxReportDetail {
  amount?: number;
  excludeVat?: boolean;
  excludeCtax?: boolean;
}

export interface ITaxReportTransaction {
  _id: string;
  journal: string;
  side: string;
  vatRowId?: string;
  ctaxRowId?: string;
  details?: ITaxReportDetail[];
}

export interface ITaxReportFollowTr {
  originId?: string;
  originType?: string;
  side?: string;
  details?: { amount?: number }[];
}

export interface ITaxReportRowDoc {
  _id: string;
  number: string;
  name?: string;
  kind: string;
  formula?: string;
  formulaText?: string;
  tabCount?: number;
  isBold?: boolean;
  percent?: number;
  valueSide?: string;
  ledgerFormulas?: ITaxRowLedgerFormula[];
}

export interface ITaxReportRecord {
  _id: string;
  number: string;
  name: string;
  kind: string;
  formulaText: string;
  tabCount: number;
  isBold: boolean;
  valueSide: string;
  value: number;
}

const amountOf = (value?: number) =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const sumAmounts = (details: { amount?: number }[] = []) =>
  details.reduce((sum, detail) => sum + amountOf(detail.amount), 0);

const roundAmount = (value: number) => Math.round(value * 100) / 100;

export const getTaxSide = (journal: string, side: string): TrSide => {
  const isDebit = side === TR_SIDES.DEBIT;

  if (SAME_SIDE_TAX_JOURNALS.has(journal)) return isDebit ? 'dt' : 'ct';

  return isDebit ? 'ct' : 'dt';
};

export const getStandardTaxPercent = (
  kind: TaxReportKind,
  rows: ITaxReportRowDoc[],
) =>
  rows.reduce((max, row) => Math.max(max, amountOf(row.percent)), 0) ||
  TAX_KIND_CONFIGS[kind].defaultStandardPercent;

/**
 * Tax and net (100%) amounts of one taxed transaction. The tax amount comes
 * from its tax journal follow transaction. When the tax side matches the main
 * side the main amount is net (100%); otherwise it is gross (110%) and this tax
 * plus the other tax's share on the same lines is removed.
 */
export const getTaxTransactionAmounts = (
  kind: TaxReportKind,
  tr: ITaxReportTransaction,
  taxTr?: ITaxReportFollowTr,
  otherTaxTr?: ITaxReportFollowTr,
) => {
  const config = TAX_KIND_CONFIGS[kind];
  const details = tr.details || [];
  const taxedDetails = details.filter((detail) => !detail[config.excludeField]);
  const base = sumAmounts(taxedDetails);
  const tax = taxTr ? sumAmounts(taxTr.details) : 0;
  const taxSide: TrSide =
    taxTr?.side === 'dt' || taxTr?.side === 'ct'
      ? taxTr.side
      : getTaxSide(tr.journal, tr.side);

  if (taxSide === tr.side) {
    return { taxSide, tax, pure: base };
  }

  const otherTax = otherTaxTr ? sumAmounts(otherTaxTr.details) : 0;
  const otherBase = sumAmounts(
    details.filter((detail) => !detail[config.otherExcludeField]),
  );
  const otherOnTaxedBase = sumAmounts(
    taxedDetails.filter((detail) => !detail[config.otherExcludeField]),
  );
  const otherShare =
    otherTax && otherBase ? (otherTax * otherOnTaxedBase) / otherBase : 0;

  return { taxSide, tax, pure: base - tax - otherShare };
};

/**
 * Pure calculation behind the tax report. Each row collects a tax-equivalent
 * amount like Erkhet's VatAdditionInfo.vat_value: the booked tax for taxed
 * rows, and the net amount at the standard rate for value-rated and 0% rows so
 * "{n} * 10" style row formulas still produce the taxable base. Opposite sides
 * (returns) are netted per row. Account formula amounts arrive precomputed in
 * `ledgerValues` keyed by row number.
 */
export const calculateTaxReport = (
  kind: TaxReportKind,
  rows: ITaxReportRowDoc[],
  transactions: ITaxReportTransaction[],
  followTrs: ITaxReportFollowTr[],
  ledgerValues: Map<string, number> = new Map(),
): ITaxReportRecord[] => {
  const config = TAX_KIND_CONFIGS[kind];
  const rowsById = new Map(rows.map((row) => [row._id, row]));
  const standardPercent = getStandardTaxPercent(kind, rows);
  const followByOrigin = new Map<string, ITaxReportFollowTr>();

  for (const followTr of followTrs) {
    if (followTr.originId && followTr.originType) {
      followByOrigin.set(
        `${followTr.originType}:${followTr.originId}`,
        followTr,
      );
    }
  }

  const signedValues = new Map<string, number>();

  for (const tr of transactions) {
    const rowId = kind === 'vat' ? tr.vatRowId : tr.ctaxRowId;
    const row = rowId ? rowsById.get(rowId) : undefined;

    if (!row || row.kind === 'title') continue;

    const { taxSide, tax, pure } = getTaxTransactionAmounts(
      kind,
      tr,
      followByOrigin.get(`${config.followType}:${tr._id}`),
      followByOrigin.get(`${config.otherFollowType}:${tr._id}`),
    );
    const value =
      config.valueRatedKinds.has(row.kind) || amountOf(row.percent) <= 0
        ? (pure * standardPercent) / 100
        : tax;
    const number = normalizeTaxRowNumber(row.number);

    signedValues.set(
      number,
      (signedValues.get(number) || 0) + (taxSide === 'dt' ? value : -value),
    );
  }

  const directValues = new Map(
    [...signedValues].map(([number, value]) => [number, Math.abs(value)]),
  );
  const values = calculateTaxRowValues(rows, directValues, ledgerValues);

  return rows
    .filter((row) => row.kind !== 'hidden')
    .map((row) => ({
      _id: row._id,
      number: row.number,
      name: row.name || '',
      kind: row.kind,
      formulaText: row.formulaText || '',
      tabCount: row.tabCount || 0,
      isBold: !!row.isBold,
      valueSide: row.valueSide || '',
      value:
        row.kind === 'title'
          ? 0
          : roundAmount(values.get(normalizeTaxRowNumber(row.number)) || 0),
    }));
};

export const compareTaxRows = (a: ITaxReportRowDoc, b: ITaxReportRowDoc) => {
  const diff = Number(a.number) - Number(b.number);

  if (Number.isFinite(diff) && diff !== 0) return diff;

  return (
    String(a.number).localeCompare(String(b.number)) ||
    String(a.name || '').localeCompare(String(b.name || ''))
  );
};
