import { IProduct, ProductDurationType } from 'erxes-api-shared/core-types';
import { splitImportTagNames } from '~/meta/import-export/utils';
import { PRODUCT_DURATION_TYPES, PRODUCT_TYPES } from '@/products/constants';

export type ProductImportRow = Partial<
  Record<
    | 'code'
    | 'name'
    | 'shortName'
    | 'description'
    | 'unitPrice'
    | 'uom'
    | 'categoryId'
    | 'vendorCode'
    | 'status'
    | 'tags'
    | 'type'
    | 'barcodes'
    | 'duration'
    | 'durationType',
    string
  >
>;

const TEXT_FIELDS = [
  'code',
  'name',
  'shortName',
  'description',
  'uom',
  'categoryId',
  'vendorCode',
  'status',
] as const;

const ALLOWED_IMPORTED_PRODUCT_TYPES = [
  PRODUCT_TYPES.SERVICE,
  PRODUCT_TYPES.UNIQUE,
  PRODUCT_TYPES.SUBSCRIPTION,
];

const cleanCellValue = (value: unknown) => String(value || '').trim();

const parseProductType = (value: unknown) => {
  const type = cleanCellValue(value).toLowerCase();

  return ALLOWED_IMPORTED_PRODUCT_TYPES.includes(type)
    ? type
    : PRODUCT_TYPES.PRODUCT;
};

const parseBarcodes = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.map(cleanCellValue).filter(Boolean);
  }

  return cleanCellValue(value)
    .split(',')
    .map((barcode) => barcode.trim())
    .filter(Boolean);
};

const parseNumber = (value: string, field: string) => {
  const number = Number(value);

  if (Number.isNaN(number)) {
    throw new Error(`${field} must be a number`);
  }

  return number;
};

const isDurationType = (value: string): value is ProductDurationType =>
  PRODUCT_DURATION_TYPES.ALL.includes(value);

/**
 * Cell text to typed values only. Product rules (category, uom, vendor, code
 * mask, duration) belong to the Products model. A field the row leaves out
 * stays absent, so an update keeps the stored value.
 */
export const parseProductRow = (
  row: ProductImportRow,
  tagIdsByName: Map<string, string>,
): Partial<IProduct> => {
  const doc: Partial<IProduct> = {};

  for (const field of TEXT_FIELDS) {
    const value = row[field];

    if (value !== undefined) {
      doc[field] = value;
    }
  }

  if (row.type !== undefined) {
    doc.type = parseProductType(row.type);
  }

  if (row.barcodes !== undefined) {
    doc.barcodes = parseBarcodes(row.barcodes);
  }

  if (row.unitPrice !== undefined) {
    doc.unitPrice = parseNumber(row.unitPrice, 'unitPrice');
  }

  if (row.duration !== undefined) {
    doc.duration = parseNumber(row.duration, 'duration');
  }

  if (row.durationType !== undefined) {
    if (!isDurationType(row.durationType)) {
      throw new Error(
        `durationType must be one of: ${PRODUCT_DURATION_TYPES.ALL.join(', ')}`,
      );
    }

    doc.durationType = row.durationType;
  }

  if (row.tags !== undefined) {
    doc.tagIds = splitImportTagNames(row.tags).flatMap(
      (name) => tagIdsByName.get(name) ?? [],
    );
  }

  return doc;
};
