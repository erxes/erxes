import type { TFunction } from 'i18next';
import { parse } from 'csv-parse/browser/esm/sync';
import { TSafeRemainderImportItem } from '../types/SafeRemainder';

const normalizeHeader = (header: string) =>
  header
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase();

const getColumn = (row: Record<string, string>, ...names: string[]) => {
  for (const name of names) {
    const value = row[normalizeHeader(name)];
    if (value !== undefined) return value.trim();
  }
  return undefined;
};

const parseNumber = (
  value: string | undefined,
  field: string,
  row: number,
  t: TFunction<'accounting'>,
) => {
  const parsed = Number(value);
  if (value === undefined || value === '' || !Number.isFinite(parsed)) {
    throw new Error(t('invalid-import-value', { row, field }));
  }
  return parsed;
};

const parseOptionalNumber = (
  value: string | undefined,
  field: string,
  row: number,
  t: TFunction<'accounting'>,
) => {
  if (value === undefined || value === '') return undefined;
  return parseNumber(value, field, row, t);
};

const parseBoolean = (
  value: string | undefined,
  row: number,
  t: TFunction<'accounting'>,
) => {
  const normalized = value?.toLowerCase();
  if (['true', '1', 'yes'].includes(normalized ?? '')) return true;
  if (['false', '0', 'no'].includes(normalized ?? '')) return false;
  throw new Error(t('invalid-import-sale-flag', { row }));
};

const parseTextRows = (
  text: string,
  t: TFunction<'accounting'>,
): TSafeRemainderImportItem[] => {
  const rows = parse(text, {
    bom: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  }) as string[][];

  return rows.map((row, index) => {
    const productCode = row[0]?.trim();
    if (!productCode)
      throw new Error(t('missing-import-product-code', { row: index + 1 }));
    return {
      productCode,
      count: parseNumber(row[1], 'count', index + 1, t),
    };
  });
};

const parseCsvRows = (
  text: string,
  t: TFunction<'accounting'>,
): TSafeRemainderImportItem[] => {
  const rows = parse(text, {
    bom: true,
    columns: (headers: string[]) => headers.map(normalizeHeader),
    skip_empty_lines: true,
    trim: true,
  }) as Record<string, string>[];

  return rows.map((row, index) => {
    const rowNumber = index + 2;
    const productCode = getColumn(row, 'productCode', 'code');
    if (!productCode) {
      throw new Error(t('missing-import-product-code', { row: rowNumber }));
    }

    const totalCost = parseOptionalNumber(
      getColumn(row, 'totalCost', 'countedCost', 'unitCost', 'trInfo.unitCost'),
      'totalCost',
      rowNumber,
      t,
    );
    const isSale = parseBoolean(
      getColumn(row, 'isSale', 'trInfo.isSale'),
      rowNumber,
      t,
    );
    const unitPrice = parseOptionalNumber(
      getColumn(row, 'unitPrice', 'trInfo.unitPrice'),
      'unitPrice',
      rowNumber,
      t,
    );

    if (isSale && unitPrice === undefined) {
      throw new Error(t('missing-import-unit-price', { row: rowNumber }));
    }

    return {
      productCode,
      count: parseNumber(getColumn(row, 'count'), 'count', rowNumber, t),
      trInfo: {
        unitCost: totalCost,
        isCostExplicit: totalCost !== undefined,
        isSale,
        unitPrice,
      },
    };
  });
};

export const parseSafeRemainderImport = (
  text: string,
  fileName: string,
  t: TFunction<'accounting'>,
) => {
  const normalizedFileName = fileName.toLowerCase();
  if (normalizedFileName.endsWith('.csv')) return parseCsvRows(text, t);
  if (normalizedFileName.endsWith('.txt')) return parseTextRows(text, t);

  throw new Error(t('only-txt-and-csv-files-can-be-imported'));
};
