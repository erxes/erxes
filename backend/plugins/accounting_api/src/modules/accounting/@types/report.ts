import { Document } from 'mongoose';
import { z } from 'zod';

const id = z.string().trim().min(1);
const period = {
  getDate: z.enum(['first', 'last', 'between']).optional(),
  isPre: z.boolean().optional(),
};
const ordered = {
  _id: id,
  code: z.string().default(''),
  name: z.string().default(''),
  order: z.number().int().nonnegative().default(0),
  isActive: z.boolean().default(true),
};
export const reportReferenceInputSchema = z.object({
  reportId: id.optional(),
  sectionId: id.optional(),
  rowId: id,
  columnId: id.optional(),
});
export const reportFormulaInputSchema = z.object({
  _id: id,
  rowId: id,
  columnId: id.optional(),
  kind: z.enum(['balance', 'transaction', 'from_row', 'ratio']),
  plusOrMinus: z.boolean().default(true),
  percent: z.string().trim().min(1).default('100'),
  debitAccountId: id.optional(),
  creditAccountId: id.optional(),
  debitAccountCategoryId: id.optional(),
  creditAccountCategoryId: id.optional(),
  ...period,
  valueSide: z.enum(['debit', 'credit']).optional(),
  source: reportReferenceInputSchema.optional(),
  ratioSource: reportReferenceInputSchema.optional(),
  ratioRule: z.enum(['divide', 'multiply']).default('divide'),
});
export const reportSectionInputSchema = z.object({
  ...ordered,
  name: z.string().trim().default(''),
  header: z.string().default(''),
  footer: z.string().default(''),
  formulaType: z.enum(['row', 'cell']).default('row'),
  columns: z.array(
    z.object({ ...ordered, ...period, name: z.string().trim().min(1) }),
  ),
  rows: z.array(
    z.object({
      ...ordered,
      ...period,
      number: z.string().default(''),
      kind: z
        .enum(['formula', 'plus_formula', 'title', 'date'])
        .default('formula'),
      valueSide: z
        .enum(['call_value', 'debit', 'credit'])
        .default('call_value'),
      isBold: z.boolean().default(false),
      isItalic: z.boolean().default(false),
      isUnderline: z.boolean().default(false),
      tabCount: z.number().int().nonnegative().default(0),
    }),
  ),
  formulas: z.array(reportFormulaInputSchema).default([]),
});
export const reportInputSchema = z.object({
  code: id,
  name: id,
  description: z.string().default(''),
  header: z.string().default(''),
  footer: z.string().default(''),
  orientation: z.enum(['portrait', 'landscape']).default('portrait'),
  status: z.enum(['active', 'archived']).default('active'),
  sections: z.array(reportSectionInputSchema).min(1),
});
export type IReport = z.infer<typeof reportInputSchema>;
export type IReportSection = IReport['sections'][number];
export type IReportFormula = z.infer<typeof reportFormulaInputSchema>;
export type IReportReference = z.infer<typeof reportReferenceInputSchema>;
export interface IReportDocument extends IReport, Document {
  _id: string;
  version: number;
  createdAt: Date;
  createdBy: string;
  modifiedAt: Date;
  modifiedBy: string;
}
export type IReportDefinition = IReport & { _id: string; version: number };

const reportDate = z.string().refine((value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}, 'Use a valid date in YYYY-MM-DD format');
export const reportGenerateInputSchema = z
  .object({
    _id: id,
    fromDate: reportDate,
    toDate: reportDate,
    amountUnit: z.enum(['units', 'thousands']).default('units'),
    decimals: z.number().int().min(0).max(6).default(2),
  })
  .refine((input) => input.toDate >= input.fromDate, {
    path: ['toDate'],
    message: 'End date must be on or after start date',
  });
export type IReportGenerateParams = z.input<typeof reportGenerateInputSchema>;
export interface IReportGeneratedCell {
  sectionId: string;
  rowId: string;
  columnId: string;
  value: number | null;
}
export interface IReportGenerated
  extends Omit<z.infer<typeof reportGenerateInputSchema>, '_id'> {
  report: IReportDocument;
  cells: IReportGeneratedCell[];
}
