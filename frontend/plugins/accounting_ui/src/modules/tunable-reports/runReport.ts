import { z } from 'zod';
import { format, startOfYear, endOfYear } from 'date-fns';
import type { TFunction } from 'i18next';

const locationFilters = ['branchId', 'departmentId'] as const;

const validDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
};
export const getReportRunSchema = (t: TFunction) =>
  z
    .object({
      fromDate: z.string().refine(validDate, t('dateError')),
      toDate: z.string().refine(validDate, t('dateError')),
      branchId: z.string().trim().optional(),
      departmentId: z.string().trim().optional(),
      amountUnit: z.enum(['units', 'thousands']).default('units'),
      decimals: z.coerce.number().int().min(0).max(6).default(2),
    })
    .refine((value) => value.toDate >= value.fromDate, {
      message: t('dateError'),
      path: ['toDate'],
    });
export type ReportRunSettings = z.infer<ReturnType<typeof getReportRunSchema>>;
export const defaultReportRunSettings = (): ReportRunSettings => ({
  fromDate: format(startOfYear(new Date()), 'yyyy-MM-dd'),
  toDate: format(endOfYear(new Date()), 'yyyy-MM-dd'),
  amountUnit: 'units',
  decimals: 2,
});
export const reportRunPath = (
  id: string,
  settings: ReportRunSettings,
): string => {
  const params = new URLSearchParams({
    fromDate: settings.fromDate,
    toDate: settings.toDate,
    amountUnit: settings.amountUnit,
    decimals: String(settings.decimals),
    inPreview: 'true',
  });
  for (const key of locationFilters) {
    const value = settings[key];
    if (value) params.set(key, value);
  }
  return `/accounting/tunable-reports/${encodeURIComponent(
    id,
  )}/print?${params.toString()}`;
};
export const parseReportRunSettings = (params: URLSearchParams, t: TFunction) =>
  getReportRunSchema(t).safeParse({
    fromDate: params.get('fromDate') ?? undefined,
    toDate: params.get('toDate') ?? undefined,
    branchId: params.get('branchId')?.trim() || undefined,
    departmentId: params.get('departmentId')?.trim() || undefined,
    amountUnit: params.get('amountUnit') ?? undefined,
    decimals: params.get('decimals') ?? undefined,
  });
