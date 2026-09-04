import { IModels } from '~/connectionResolvers';
import { PRODUCT_TYPES } from '@/products/constants';

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

const generateTagIds = async (models: IModels, tags: string = '') => {
  const tagNames = tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const tagIds = await Promise.all(
    tagNames.map(async (name) => {
      const existing = await models.Tags.findOne({
        name,
        type: 'core:product',
      }).lean();

      if (existing) return existing._id;

      const created = await models.Tags.createTag({
        name,
        type: 'core:product',
      });

      return created._id;
    }),
  );

  return tagIds;
};

export async function prepareProductDoc(models: IModels, row: any) {
  const doc: any = { ...row };

  doc.createdAt = new Date();
  doc.updatedAt = new Date();
  doc.type = parseProductType(doc.type);

  if (doc.barcodes !== undefined && doc.barcodes !== null) {
    doc.barcodes = parseBarcodes(doc.barcodes);
  }

  if (!doc.code) {
    throw new Error('code is required');
  }

  if (doc.unitPrice !== undefined && doc.unitPrice !== null && doc.unitPrice !== '') {
    doc.unitPrice = Number(doc.unitPrice);
    if (Number.isNaN(doc.unitPrice)) throw new Error('unitPrice must be a number');
  }

  if (doc.tags) {
    doc.tagIds = await generateTagIds(models, doc.tags);
    delete doc.tags;
  }

  return doc;
}
