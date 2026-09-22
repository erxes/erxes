import { IModels } from '~/connectionResolvers';
import {
  IVatRow,
  VAT_ROW_STATUS,
  VatRowKinds,
} from '~/modules/accounting/@types/vatRow';

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

  for (const row of rows) {
    try {
      const doc = prepareVatRowDoc(row);
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
