import { getI18n } from 'react-i18next';
import { parse } from 'csv-parse/browser/esm/sync';
import { TSafeRemainderImportItem } from '@/inventories/safeRemainders/types/SafeRemainder';

const translateImportError = (
  key: string,
  defaultValue: string,
  values: { row?: number; field?: string } = {},
): string =>
  getI18n()?.t(key, { ns: 'accounting', defaultValue, ...values }) ??
  defaultValue;

const normalizeHeader = (header: string) =>
  header
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');

const parseNumber = (value: string | undefined, field: string, row: number) => {
  const parsed = Number(value);
  if (value === undefined || value === '' || !Number.isFinite(parsed)) {
    throw new Error(
      translateImportError(
        'import-invalid-number',
        `${row}-р мөрийн ${field} утга буруу байна`,
        { row, field },
      ),
    );
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
  throw new Error(
    translateImportError(
      'import-invalid-sale-flag',
      `${row}-р мөрийн isSale утга true/false байх ёстой`,
      { row },
    ),
  );
};

export const parseSafeRemainderText = (
  text: string,
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
      throw new Error(
        translateImportError(
          'import-missing-code',
          `${index + 1}-р мөрийн код хоосон байна`,
          { row: index + 1 },
        ),
      );
    return {
      productCode,
      count: parseNumber(row[1], 'count', index + 1),
    };
  });
};

export type SafeRemainderCsvPreview = {
  headers: string[];
  rows: string[][];
};

export const SAFE_REMAINDER_CSV_FIELDS = [
  {
    key: 'productCode',
    aliases: ['code'],
    required: true,
    dataType: 'text',
    example: '001',
  },
  {
    key: 'count',
    aliases: [],
    required: true,
    dataType: 'number',
    example: '10',
  },
  {
    key: 'totalCost',
    aliases: ['countedCost', 'unitCost', 'trInfo.unitCost'],
    required: false,
    dataType: 'number',
    example: '50000',
  },
  {
    key: 'isSale',
    aliases: ['trInfo.isSale'],
    required: true,
    dataType: 'boolean',
    example: 'false',
  },
  {
    key: 'unitPrice',
    aliases: ['trInfo.unitPrice'],
    required: false,
    dataType: 'number',
    example: '6000',
  },
] as const;

export const previewSafeRemainderCsv = (
  text: string,
): SafeRemainderCsvPreview => {
  const records = parse(text, {
    bom: true,
    skip_empty_lines: true,
    trim: true,
  }) as string[][];
  return { headers: records[0] ?? [], rows: records.slice(1) };
};

export const suggestSafeRemainderCsvMapping = (headers: string[]): string[] =>
  headers.map(
    (header) =>
      SAFE_REMAINDER_CSV_FIELDS.find((field) =>
        [field.key, ...field.aliases].some(
          (name) => normalizeHeader(name) === normalizeHeader(header),
        ),
      )?.key ?? '',
  );

export const mapSafeRemainderCsv = (
  preview: SafeRemainderCsvPreview,
  mapping: string[],
): TSafeRemainderImportItem[] => {
  const keys = mapping.filter(Boolean);
  const missing = SAFE_REMAINDER_CSV_FIELDS.filter(
    (field) => field.required && !keys.includes(field.key),
  );
  if (missing.length || new Set(keys).size !== keys.length) {
    throw new Error(
      translateImportError(
        'import-column-mapping-invalid',
        'Шаардлагатай талбаруудыг сонгож, давхардсан талбаруудыг засна уу',
      ),
    );
  }
  const rows = preview.rows.map((values) => {
    const row: Record<string, string> = {};
    mapping.forEach((key, index) => {
      if (SAFE_REMAINDER_CSV_FIELDS.some((field) => field.key === key)) {
        row[key] = values[index]?.trim() ?? '';
      }
    });
    return row;
  });

  return rows.map((row, index) => {
    const rowNumber = index + 2;
    const productCode = row.productCode;
    if (!productCode) {
      throw new Error(
        translateImportError(
          'import-missing-product-code',
          `${rowNumber}-р мөрийн productCode хоосон байна`,
          { row: rowNumber },
        ),
      );
    }

    const totalCost = parseOptionalNumber(
      row.totalCost,
      'totalCost',
      rowNumber,
    );
    const isSale = parseBoolean(row.isSale, rowNumber);
    const unitPrice = parseOptionalNumber(
      row.unitPrice,
      'unitPrice',
      rowNumber,
    );

    if (isSale && unitPrice === undefined) {
      throw new Error(
        translateImportError(
          'import-missing-unit-price',
          `${rowNumber}-р мөрийн unitPrice шаардлагатай`,
          { row: rowNumber },
        ),
      );
    }

    return {
      productCode,
      count: parseNumber(row.count, 'count', rowNumber),
      trInfo: {
        unitCost: totalCost,
        isCostExplicit: totalCost !== undefined,
        isSale,
        unitPrice,
      },
    };
  });
};
