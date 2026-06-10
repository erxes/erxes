import { PRODUCT_TYPES } from '@/products/constants';
import { IModels } from '~/connectionResolvers';
import { extractPropertiesData } from '~/meta/import-export/utils';

const isEmpty = (v: any) =>
  v === undefined || v === null || v === '' || v === '-';

const generateTagIds = async (models: IModels, tags = '') => {
  const tagNames = tags
    .split(/[,;]/)
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

const ARRAY_FIELDS = ['scopeBrandIds', 'sameMasks', 'sameDefault'];

export async function prepareProductDoc(models: IModels, row: any) {
  const doc: any = { ...row };

  for (const field of ARRAY_FIELDS) {
    if (field in doc) {
      const v = doc[field];
      if (isEmpty(v)) {
        delete doc[field];
      } else if (typeof v === 'string') {
        const arr = v
          .split(/[,;]/)
          .map((s: string) => s.trim())
          .filter(Boolean);
        if (arr.length) doc[field] = arr;
        else delete doc[field];
      }
    }
  }

  await extractPropertiesData(models, doc);

  doc.createdAt = new Date();
  doc.updatedAt = new Date();

  if (!doc.code && doc.code !== 0) throw new Error('code is required');
  doc.code = String(doc.code).trim();
  if (!doc.code) throw new Error('code is required');

  if (!isEmpty(doc.unitPrice)) {
    doc.unitPrice = Number(doc.unitPrice);
    if (Number.isNaN(doc.unitPrice))
      throw new Error('unitPrice must be a number');
  } else {
    delete doc.unitPrice;
  }

  if ('type' in doc) {
    if (isEmpty(doc.type) || !PRODUCT_TYPES.ALL.includes(doc.type)) {
      delete doc.type;
    }
  }

  if ('barcodes' in doc) {
    if (isEmpty(doc.barcodes)) {
      delete doc.barcodes;
    } else if (typeof doc.barcodes === 'string') {
      const arr = doc.barcodes
        .split(/[,;]/)
        .map((s: string) => s.trim())
        .filter(Boolean);
      if (arr.length) doc.barcodes = arr;
      else delete doc.barcodes;
    }
  }

  if ('barcodeDescription' in doc && isEmpty(doc.barcodeDescription)) {
    delete doc.barcodeDescription;
  }

  if (doc.tags && !isEmpty(doc.tags)) {
    doc.tagIds = await generateTagIds(models, doc.tags);
  }
  delete doc.tags;

  if (doc.categoryName && !isEmpty(doc.categoryName)) {
    const categoryName = String(doc.categoryName).trim();
    const existing = await models.ProductCategories.findOne({
      name: categoryName,
    }).lean();
    if (existing) {
      doc.categoryId = existing._id;
    } else {
      const code =
        categoryName
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          .slice(0, 50) || `cat-${Date.now()}`;
      const created = await models.ProductCategories.createProductCategory({
        name: categoryName,
        code,
      } as any);
      doc.categoryId = created._id;
    }
    delete doc.categoryName;
  } else {
    delete doc.categoryName;
  }

  if (doc.imageUrl && !isEmpty(doc.imageUrl)) {
    const url = String(doc.imageUrl).trim();
    doc.attachment = {
      url,
      name: url.split('/').pop() || url,
      type: '',
      size: 0,
    };
  }
  delete doc.imageUrl;

  if (doc.imageUrls && !isEmpty(doc.imageUrls)) {
    const urls = String(doc.imageUrls)
      .split(';')
      .map((u: string) => u.trim())
      .filter(Boolean);
    doc.attachmentMore = urls.map((url: string) => ({
      url,
      name: url.split('/').pop() || url,
      type: '',
      size: 0,
    }));
  }
  delete doc.imageUrls;

  return doc;
}
