import { z } from 'zod';

const id = z.string().trim().min(1);
const numericPercent = '-?\\d+(?:\\.\\d+)?';
const percentageRule = new RegExp(
  `^(?:${numericPercent}|if\\(\\w+\\s*(?:>=|<=|!=|>|<|=)\\s*${numericPercent}\\s*:\\s*(?:${numericPercent}|\\[${numericPercent}\\])(?:\\s*,\\s*\\w+\\s*(?:>=|<=|!=|>|<|=)\\s*${numericPercent}\\s*:\\s*(?:${numericPercent}|\\[${numericPercent}\\]))*\\)\\s*${numericPercent})$`,
);
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
  percent: z
    .string()
    .trim()
    .regex(percentageRule, 'Enter a numeric percentage or valid if rule')
    .default('100'),
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
const reportDefinitionSchema = z.object({
  code: id,
  name: id,
  description: z.string().default(''),
  header: z.string().default(''),
  footer: z.string().default(''),
  orientation: z.enum(['portrait', 'landscape']).default('portrait'),
  status: z.enum(['active', 'archived']).default('active'),
  sections: z.array(reportSectionInputSchema).min(1),
});

export type ReportValues = z.infer<typeof reportDefinitionSchema>;
export type ReportSection = ReportValues['sections'][number];
export type ReportFormula = ReportSection['formulas'][number];

export const reportFormSchema = reportDefinitionSchema.superRefine(
  (report, context) => {
    report.sections.forEach((section, sectionIndex) => {
      if (!section.columns.length && section.formulas.length)
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['sections', sectionIndex, 'columns'],
          message: 'Add a column before configuring formulas',
        });
      section.formulas.forEach((formula, formulaIndex) => {
        const base = ['sections', sectionIndex, 'formulas', formulaIndex];
        const issue = (field: string, message: string) =>
          context.addIssue({
            code: z.ZodIssueCode.custom,
            path: [...base, field],
            message,
          });
        const row = section.rows.find((row) => row._id === formula.rowId);
        const columns =
          section.formulaType === 'cell'
            ? section.columns.filter(
                (column) => column._id === formula.columnId,
              )
            : section.columns;
        if (!row) issue('rowId', 'Select a target row');
        if (!columns.length) issue('columnId', 'Select a target column');
        if (
          (formula.kind === 'from_row' || formula.kind === 'ratio') &&
          !formula.source
        )
          issue('source', 'Select a source row');
        if (formula.kind === 'ratio' && !formula.ratioSource)
          issue('ratioSource', 'Select a ratio source');
        if (!row) return;
        columns.forEach((column) => {
          const date = formula.getDate ?? column.getDate ?? row.getDate;
          if (!date)
            issue('getDate', 'Select a date on the formula, row or column');
          if (formula.kind === 'balance' && date === 'between')
            issue(
              'getDate',
              'Balance formulas require an opening or closing date',
            );
          if (formula.kind === 'transaction' && date && date !== 'between')
            issue('getDate', 'Transaction formulas require the between period');
        });
      });
    });
  },
);
