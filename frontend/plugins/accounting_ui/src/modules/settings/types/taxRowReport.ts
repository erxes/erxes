import { z } from 'zod';

export const TAX_ROW_VALUE_SIDES = ['debit', 'credit'] as const;

export type TaxRowValueSide = (typeof TAX_ROW_VALUE_SIDES)[number];

const optionalId = z.string().optional();

export const taxRowLedgerFormulaSchema = z
  .object({
    _id: z.string().min(1),
    kind: z.enum(['balance', 'transaction']),
    plusOrMinus: z.boolean(),
    percent: z.string().trim().min(1, 'Percentage is required'),
    debitAccountId: optionalId,
    creditAccountId: optionalId,
    debitAccountCategoryId: optionalId,
    creditAccountCategoryId: optionalId,
    getDate: z.enum(['first', 'last', 'between']),
    valueSide: z.enum(TAX_ROW_VALUE_SIDES).optional(),
  })
  .refine(
    (formula) =>
      !!(
        formula.debitAccountId ||
        formula.creditAccountId ||
        formula.debitAccountCategoryId ||
        formula.creditAccountCategoryId
      ),
    {
      message: 'Choose an account or account category',
      path: ['debitAccountId'],
    },
  );

export const taxRowLedgerFormulasFormSchema = z.object({
  formulas: z.array(taxRowLedgerFormulaSchema),
});

export type ITaxRowLedgerFormula = z.infer<typeof taxRowLedgerFormulaSchema>;

export type TTaxRowLedgerFormulasForm = z.infer<
  typeof taxRowLedgerFormulasFormSchema
>;

export interface ITaxRowReportValues {
  kind?: string | null;
  formula?: string | null;
  formulaText?: string | null;
  valueSide?: string | null;
  ledgerFormulas?: unknown;
}

export type TTaxRowReportChange = Partial<{
  formula: string;
  formulaText: string;
  valueSide: string;
  ledgerFormulas: ITaxRowLedgerFormula[];
}>;

export const parseTaxRowLedgerFormulas = (
  value: unknown,
): ITaxRowLedgerFormula[] =>
  Array.isArray(value)
    ? value.flatMap((item: unknown) => {
        const parsed = taxRowLedgerFormulaSchema.safeParse(item);
        return parsed.success ? [parsed.data] : [];
      })
    : [];
