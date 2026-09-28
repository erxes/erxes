import { parse } from 'csv-parse/browser/esm/sync';
import { TSafeRemainderImportItem } from '../types/SafeRemainder';

const normalizeHeader = (header: string) =>
  header.replace(/^\uFEFF/, '').trim().toLowerCase();

const getColumn = (row: Record<string, string>, ...names: string[]) => {
  for (const name of names) {
    const value = row[normalizeHeader(name)];
    if (value !== undefined) return value.trim();
  }
  return undefined;
};

const parseNumber = (value: string | undefined, field: string, row: number) => {
  const parsed = Number(value);
  if (value === undefined || value === '' || !Number.isFinite(parsed)) {
    throw new Error(`${row}-р мөрийн ${field} утга буруу байна`);
  }
  return parsed;
};

const parseOptionalNumber = (
  value: string | undefined,
  field: string,
  row: number,
) => {
  if (value === undefined || value === '') return undefined;
  return parseNumber(value, field, row);
};

const parseBoolean = (value: string | undefined, row: number) => {
  const normalized = value?.toLowerCase();
  if (['true', '1', 'yes'].includes(normalized ?? '')) return true;
  if (['false', '0', 'no'].includes(normalized ?? '')) return false;
  throw new Error(`${row}-р мөрийн isSale утга true/false байх ёстой`);
};

const parseTextRows = (text: string): TSafeRemainderImportItem[] => {
  const rows = parse(text, {
    bom: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  }) as string[][];

  return rows.map((row, index) => {
    const productCode = row[0]?.trim();
    if (!productCode) throw new Error(`${index + 1}-р мөрийн код хоосон байна`);
    return {
      productCode,
      count: parseNumber(row[1], 'count', index + 1),
    };
  });
};

const parseCsvRows = (text: string): TSafeRemainderImportItem[] => {
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
      throw new Error(`${rowNumber}-р мөрийн productCode хоосон байна`);
    }

    const totalCost = parseOptionalNumber(
      getColumn(
        row,
        'totalCost',
        'countedCost',
        'unitCost',
        'trInfo.unitCost',
      ),
      'totalCost',
      rowNumber,
    );
    const isSale = parseBoolean(
      getColumn(row, 'isSale', 'trInfo.isSale'),
      rowNumber,
    );
    const unitPrice = parseOptionalNumber(
      getColumn(row, 'unitPrice', 'trInfo.unitPrice'),
      'unitPrice',
      rowNumber,
    );

    if (isSale && unitPrice === undefined) {
      throw new Error(`${rowNumber}-р мөрийн unitPrice шаардлагатай`);
    }

    return {
      productCode,
      count: parseNumber(getColumn(row, 'count'), 'count', rowNumber),
      trInfo: {
        unitCost: totalCost,
        isCostExplicit: totalCost !== undefined,
        isSale,
        unitPrice,
      },
    };
  });
};

export const parseSafeRemainderImport = (text: string, fileName: string) => {
  const normalizedFileName = fileName.toLowerCase();
  if (normalizedFileName.endsWith('.csv')) return parseCsvRows(text);
  if (normalizedFileName.endsWith('.txt')) return parseTextRows(text);

  throw new Error('Зөвхөн TXT эсвэл CSV файл импортлоно');
};
