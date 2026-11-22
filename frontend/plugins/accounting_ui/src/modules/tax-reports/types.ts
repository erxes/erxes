import { z } from 'zod';

export const TAX_REPORT_KINDS = ['vat', 'ctax'] as const;

export type TaxReportKind = (typeof TAX_REPORT_KINDS)[number];

export const TAX_REPORT_TITLES: Record<TaxReportKind, string> = {
  vat: 'vat-report',
  ctax: 'ctax-report',
};

export const isTaxReportKind = (value: unknown): value is TaxReportKind =>
  (TAX_REPORT_KINDS as readonly unknown[]).includes(value);

export const taxReportRowSchema = z.object({
  _id: z.string(),
  number: z.string(),
  name: z.string().default(''),
  kind: z.string(),
  formulaText: z.string().default(''),
  tabCount: z.number().default(0),
  isBold: z.boolean().default(false),
  valueSide: z.string().default(''),
  value: z.number().default(0),
});

export type TaxReportRow = z.infer<typeof taxReportRowSchema>;

const TAX_REPORT_LIST_PREFIX = 'tax:';

/** Key of a tax report inside the journal reports list (`activeReportState`). */
export const getTaxReportListKey = (kind: TaxReportKind) =>
  `${TAX_REPORT_LIST_PREFIX}${kind}`;

export const getTaxReportKindFromListKey = (
  key: string,
): TaxReportKind | undefined => {
  if (!key.startsWith(TAX_REPORT_LIST_PREFIX)) return undefined;
  const kind = key.slice(TAX_REPORT_LIST_PREFIX.length);
  return isTaxReportKind(kind) ? kind : undefined;
};
