import {
  ITaxRowLedgerFormula,
  ITaxRowReportFields,
  TAX_ROW_VALUE_SIDES,
  taxRowLedgerFormulaSchema,
} from '../../@types/taxRow';
import { validateReportPercent } from '../tunableReports/percent';
import { evaluateTaxFormula } from './formula';

const validateLedgerFormula = (
  formula: ITaxRowLedgerFormula,
  index: number,
) => {
  const label = `Account formula ${index + 1}`;

  if (
    !formula.debitAccountId &&
    !formula.creditAccountId &&
    !formula.debitAccountCategoryId &&
    !formula.creditAccountCategoryId
  ) {
    throw new Error(`${label}: choose an account or account category`);
  }

  try {
    validateReportPercent(formula.percent);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`${label}: ${message}`);
  }
};

/**
 * Validates and normalizes the report fields of a VAT or city tax row. Only
 * the submitted fields are checked so single-field panel edits stay valid.
 */
export const cleanTaxRowReportFields = <T extends ITaxRowReportFields>(
  doc: T,
): T => {
  const cleaned = { ...doc };

  if (typeof cleaned.formula === 'string' && cleaned.formula.trim()) {
    try {
      evaluateTaxFormula(cleaned.formula, () => 1);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Invalid formula: ${message}`);
    }
  }

  if (cleaned.valueSide !== undefined && cleaned.valueSide !== null) {
    const side = String(cleaned.valueSide);

    if (side && !(TAX_ROW_VALUE_SIDES as readonly string[]).includes(side)) {
      throw new Error(`Invalid settlement column: ${side}`);
    }
  }

  if (cleaned.ledgerFormulas !== undefined && cleaned.ledgerFormulas !== null) {
    const parsed = taxRowLedgerFormulaSchema
      .array()
      .safeParse(cleaned.ledgerFormulas);

    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      throw new Error(
        `Invalid account formula ${issue.path.join('.')}: ${issue.message}`,
      );
    }

    parsed.data.forEach(validateLedgerFormula);
    cleaned.ledgerFormulas = parsed.data;
  }

  return cleaned;
};
