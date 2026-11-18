import { z } from 'zod';

const optionalId = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);

export const TAX_ROW_VALUE_SIDES = ['debit', 'credit'] as const;

export type TaxRowValueSide = (typeof TAX_ROW_VALUE_SIDES)[number];

/**
 * Account formula of a tax row, the same balance/transaction rule the tunable
 * reports use. Rows with a value side (Erkhet's "Ё. ТАТВАРЫН ТООЦООЛОЛ")
 * print in a debit or credit column and read these formulas from the ledger.
 * A transaction formula reads the turnover of its `valueSide`, defaulting to
 * the row side.
 */
export const taxRowLedgerFormulaSchema = z.object({
  _id: z.string().trim().min(1),
  kind: z.enum(['balance', 'transaction']),
  plusOrMinus: z.boolean().default(true),
  percent: z.string().trim().min(1).default('100'),
  debitAccountId: optionalId,
  creditAccountId: optionalId,
  debitAccountCategoryId: optionalId,
  creditAccountCategoryId: optionalId,
  getDate: z.enum(['first', 'last', 'between']),
  valueSide: z.enum(TAX_ROW_VALUE_SIDES).optional(),
});

export type ITaxRowLedgerFormula = z.infer<typeof taxRowLedgerFormulaSchema>;

export interface ITaxRowReportFields {
  formula?: string;
  formulaText?: string;
  tabCount?: number;
  isBold?: boolean;
  valueSide?: TaxRowValueSide | '';
  ledgerFormulas?: ITaxRowLedgerFormula[];
}
