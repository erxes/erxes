import { TaxReportRow, taxReportRowSchema } from '../types';

export const parseTaxReportRows = (value: unknown): TaxReportRow[] =>
  Array.isArray(value)
    ? value.flatMap((item: unknown) => {
        const parsed = taxReportRowSchema.safeParse(item);
        return parsed.success ? [parsed.data] : [];
      })
    : [];
