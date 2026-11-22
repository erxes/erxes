import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';
import {
  ITaxRowLedgerFormula,
  TaxRowValueSide,
  taxRowLedgerFormulaSchema,
} from '~/modules/accounting/@types/taxRow';
import {
  IVatRow,
  VAT_ROW_STATUS,
  VatRowKinds,
} from '~/modules/accounting/@types/vatRow';
import { cleanTaxRowReportFields } from '~/modules/accounting/utils/taxReports/rowValidation';

type ImportRow = Record<string, unknown>;
type ImportResultRow = ImportRow & { _id?: unknown; error?: string };

const getString = (row: ImportRow, key: string) => {
  const value = row[key];

  if (value === undefined || value === null) {
    return '';
  }

  return String(value).trim();
};

const getNumber = (row: ImportRow, key: string) => {
  const value = Number(getString(row, key));

  return Number.isFinite(value) ? value : 0;
};

const getBoolean = (row: ImportRow, key: string) => {
  return ['1', 'true', 'yes', 'bold', 'b'].includes(
    getString(row, key).toLowerCase(),
  );
};

const getKind = (row: ImportRow) => {
  const kind = getString(row, 'kindz') || getString(row, 'kind');

  return VatRowKinds.ALL.includes(kind) ? kind : VatRowKinds.NORMAL;
};

const hasColumn = (row: ImportRow, ...keys: string[]) =>
  keys.some((key) => key in row);

const toText = (value: unknown) =>
  typeof value === 'string' || typeof value === 'number'
    ? String(value).trim()
    : '';

type CodeLookup = (code: string) => Promise<string>;

// Account formulas are imported with Erkhet's account and category codes
// (`debitAccountCode`, `creditAccountCategoryCode`, ...) or with ids.
const CODE_FIELDS = [
  ['debitAccountCode', 'debitAccountId', 'account'],
  ['creditAccountCode', 'creditAccountId', 'account'],
  ['debitAccountCategoryCode', 'debitAccountCategoryId', 'category'],
  ['creditAccountCategoryCode', 'creditAccountCategoryId', 'category'],
] as const;

type CodeLookups = Record<'account' | 'category', CodeLookup>;

const parseLedgerFormula = async (
  item: unknown,
  position: number,
  lookups: CodeLookups,
): Promise<ITaxRowLedgerFormula> => {
  if (!item || typeof item !== 'object') {
    throw new TypeError('ledger formulas must contain objects');
  }

  const source = item as Record<string, unknown>;
  const formula: Record<string, unknown> = { ...source };
  const ids = await Promise.all(
    CODE_FIELDS.map(([codeField, , lookup]) => {
      const code = toText(source[codeField]);
      return code ? lookups[lookup](code) : Promise.resolve('');
    }),
  );

  CODE_FIELDS.forEach(([codeField, idField], index) => {
    delete formula[codeField];
    if (ids[index]) formula[idField] = ids[index];
  });
  formula._id = toText(source._id) || nanoid();

  const parsed = taxRowLedgerFormulaSchema.safeParse(formula);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new Error(
      `ledger formula ${position} ${issue.path.join('.')}: ${issue.message}`,
    );
  }

  return parsed.data;
};

const parseLedgerFormulas = (
  value: string,
  lookups: CodeLookups,
): Promise<ITaxRowLedgerFormula[]> => {
  if (!value) {
    return Promise.resolve([]);
  }

  let items: unknown;

  try {
    items = JSON.parse(value);
  } catch {
    throw new Error('ledger formulas must be a JSON array');
  }

  if (!Array.isArray(items)) {
    throw new TypeError('ledger formulas must be a JSON array');
  }

  return Promise.all(
    items.map((item, index) => parseLedgerFormula(item, index + 1, lookups)),
  );
};

const createCodeLookup = (
  find: (code: string) => Promise<{ _id: unknown } | null>,
  label: string,
): CodeLookup => {
  const cache = new Map<string, string>();

  return async (code) => {
    const cached = cache.get(code);
    if (cached) return cached;

    const doc = await find(code);
    if (!doc) {
      throw new Error(`${label} code ${code} not found`);
    }

    const id = String(doc._id);
    cache.set(code, id);
    return id;
  };
};

export const prepareVatRowDoc = (row: ImportRow): IVatRow => {
  const number = getString(row, 'number');

  if (!number) {
    throw new Error('number is required');
  }

  return {
    name: getString(row, 'name'),
    number,
    kind: getKind(row),
    formula: getString(row, 'formula'),
    formulaText:
      getString(row, 'formula_text') || getString(row, 'formulaText'),
    tabCount: getNumber(row, 'tab_count') || getNumber(row, 'tabCount'),
    isBold: getBoolean(row, 'is_b') || getBoolean(row, 'isBold'),
    status: getString(row, 'status') || VAT_ROW_STATUS.ACTIVE,
    percent: getNumber(row, 'percent'),
    ...(hasColumn(row, 'value_side', 'valueSide')
      ? {
          valueSide: (getString(row, 'value_side') ||
            getString(row, 'valueSide')) as TaxRowValueSide | '',
        }
      : {}),
  };
};

export const processVatRows = async (
  _subdomain: string,
  models: IModels,
  rows: ImportRow[],
): Promise<{
  successRows: ImportResultRow[];
  errorRows: ImportResultRow[];
}> => {
  const successRows: ImportResultRow[] = [];
  const errorRows: ImportResultRow[] = [];
  const numbers = rows.map((row) => getString(row, 'number')).filter(Boolean);

  const existingDocs = await models.VatRows.find({
    ...(numbers.length ? { number: { $in: numbers } } : {}),
  }).lean();

  const existingByNumber = new Map<string, { _id: unknown; number?: string }>();

  for (const doc of existingDocs) {
    if (doc.number) {
      existingByNumber.set(doc.number, {
        _id: doc._id,
        number: doc.number,
      });
    }
  }

  const lookups = {
    account: createCodeLookup(
      (code) => models.Accounts.findOne({ code }, { _id: 1 }).lean(),
      'Account',
    ),
    category: createCodeLookup(
      (code) => models.AccountCategories.findOne({ code }, { _id: 1 }).lean(),
      'Account category',
    ),
  };

  // Docs are prepared (codes resolved, fields validated) up front; writes stay
  // in file order so a repeated number updates the row created before it.
  const prepared = await Promise.all(
    rows.map(async (row) => {
      try {
        const doc = prepareVatRowDoc(row);

        if (hasColumn(row, 'ledger_formulas', 'ledgerFormulas')) {
          doc.ledgerFormulas = await parseLedgerFormulas(
            getString(row, 'ledger_formulas') ||
              getString(row, 'ledgerFormulas'),
            lookups,
          );
        }

        return { row, doc: cleanTaxRowReportFields(doc) };
      } catch (error) {
        return { row, error };
      }
    }),
  );

  for (const { row, doc, error: prepareError } of prepared) {
    try {
      if (!doc) {
        throw prepareError;
      }

      const existing = existingByNumber.get(doc.number);

      if (existing) {
        await models.VatRows.updateOne({ _id: existing._id }, { $set: doc });
        successRows.push({ ...row, _id: existing._id });
      } else {
        const vatRow = await models.VatRows.createVatRow(doc);
        successRows.push({ ...row, _id: vatRow._id });
        existingByNumber.set(doc.number, {
          _id: vatRow._id,
          number: doc.number,
        });
      }
    } catch (error) {
      errorRows.push({
        ...row,
        error: error instanceof Error ? error.message : 'Failed to prepare row',
      });
    }
  }

  return { successRows, errorRows };
};
