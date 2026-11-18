import { z } from 'zod';
import {
  reportDefinitionSchema,
  reportFormulaInputSchema,
  reportReferenceInputSchema,
  reportSectionInputSchema,
  ReportValues,
} from '@/tunable-reports/schema';

// Portable report JSON: identical to the editable report, except that tenant
// ids are replaced by codes so a definition can move between organizations.
const code = z.string().trim().min(1);
const transferReferenceSchema = reportReferenceInputSchema
  .omit({ reportId: true })
  .extend({ reportCode: code.optional() });
const transferFormulaSchema = reportFormulaInputSchema
  .omit({
    debitAccountId: true,
    creditAccountId: true,
    debitAccountCategoryId: true,
    creditAccountCategoryId: true,
    source: true,
    ratioSource: true,
  })
  .extend({
    debitAccountCode: code.optional(),
    creditAccountCode: code.optional(),
    debitAccountCategoryCode: code.optional(),
    creditAccountCategoryCode: code.optional(),
    source: transferReferenceSchema.optional(),
    ratioSource: transferReferenceSchema.optional(),
  });
export const reportTransferSchema = reportDefinitionSchema.extend({
  sections: z
    .array(
      reportSectionInputSchema.extend({
        formulas: z.array(transferFormulaSchema).default([]),
      }),
    )
    .min(1),
});
export type ReportTransfer = z.infer<typeof reportTransferSchema>;
type TransferReference = z.infer<typeof transferReferenceSchema>;
type Reference = z.infer<typeof reportReferenceInputSchema>;

export interface ReportTransferMaps {
  accounts: Map<string, string>;
  categories: Map<string, string>;
  reports: Map<string, string>;
}
export interface ReportTransferResult<T> {
  value: T;
  // Ids or codes that could not be translated, prefixed by their kind.
  missing: string[];
}

const translate = (
  map: Map<string, string>,
  key: string | undefined,
  kind: string,
  missing: Set<string>,
): string | undefined => {
  if (!key) return undefined;
  const value = map.get(key);
  if (!value) missing.add(`${kind} ${key}`);
  return value;
};

/** Form state → portable JSON (ids → codes). `maps` are keyed by id. */
export const reportToTransfer = (
  values: ReportValues,
  maps: ReportTransferMaps,
  currentReportId?: string,
): ReportTransferResult<ReportTransfer> => {
  const missing = new Set<string>();
  const reference = (
    value: Reference | undefined,
  ): TransferReference | undefined => {
    if (!value) return undefined;
    const { reportId, ...rest } = value;
    const own = !reportId || reportId === currentReportId;
    return {
      ...rest,
      reportCode: own
        ? undefined
        : translate(maps.reports, reportId, 'report', missing),
    };
  };
  const value: ReportTransfer = {
    ...values,
    sections: values.sections.map((section) => ({
      ...section,
      formulas: section.formulas.map(
        ({
          debitAccountId,
          creditAccountId,
          debitAccountCategoryId,
          creditAccountCategoryId,
          source,
          ratioSource,
          ...formula
        }) => ({
          ...formula,
          debitAccountCode: translate(
            maps.accounts,
            debitAccountId,
            'account',
            missing,
          ),
          creditAccountCode: translate(
            maps.accounts,
            creditAccountId,
            'account',
            missing,
          ),
          debitAccountCategoryCode: translate(
            maps.categories,
            debitAccountCategoryId,
            'category',
            missing,
          ),
          creditAccountCategoryCode: translate(
            maps.categories,
            creditAccountCategoryId,
            'category',
            missing,
          ),
          source: reference(source),
          ratioSource: reference(ratioSource),
        }),
      ),
    })),
  };
  return { value, missing: [...missing] };
};

/** Accepts one report object, or a file wrapper `{ reports: [report] }`. */
export const parseReportTransfer = (
  text: string,
):
  | { success: true; data: ReportTransfer }
  | { success: false; error: string } => {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
  if (raw && typeof raw === 'object' && 'reports' in raw) {
    const { reports } = raw;
    if (!Array.isArray(reports) || reports.length !== 1)
      return { success: false, error: 'Paste exactly one report' };
    raw = reports[0];
  }
  const parsed = reportTransferSchema.safeParse(raw);
  if (parsed.success) return { success: true, data: parsed.data };
  return {
    success: false,
    error: parsed.error.issues
      .slice(0, 5)
      .map((issue) => `${issue.path.join('.') || 'report'}: ${issue.message}`)
      .join('; '),
  };
};

/** Portable JSON → form state (codes → ids). `maps` are keyed by code. */
export const transferToReport = (
  transfer: ReportTransfer,
  maps: ReportTransferMaps,
): ReportTransferResult<ReportValues> => {
  const missing = new Set<string>();
  const reference = (
    value: TransferReference | undefined,
  ): Reference | undefined => {
    if (!value) return undefined;
    const { reportCode, ...rest } = value;
    const own = !reportCode || reportCode === transfer.code;
    return {
      ...rest,
      reportId: own
        ? undefined
        : translate(maps.reports, reportCode, 'report', missing),
    };
  };
  const value: ReportValues = {
    ...transfer,
    sections: transfer.sections.map((section) => ({
      ...section,
      formulas: section.formulas.map(
        ({
          debitAccountCode,
          creditAccountCode,
          debitAccountCategoryCode,
          creditAccountCategoryCode,
          source,
          ratioSource,
          ...formula
        }) => ({
          ...formula,
          debitAccountId: translate(
            maps.accounts,
            debitAccountCode,
            'account',
            missing,
          ),
          creditAccountId: translate(
            maps.accounts,
            creditAccountCode,
            'account',
            missing,
          ),
          debitAccountCategoryId: translate(
            maps.categories,
            debitAccountCategoryCode,
            'category',
            missing,
          ),
          creditAccountCategoryId: translate(
            maps.categories,
            creditAccountCategoryCode,
            'category',
            missing,
          ),
          source: reference(source),
          ratioSource: reference(ratioSource),
        }),
      ),
    })),
  };
  return { value, missing: [...missing] };
};

/** JSON text without undefined fields, stable for copying between tenants. */
export const formatReportTransfer = (transfer: ReportTransfer): string =>
  JSON.stringify(transfer, null, 2);
