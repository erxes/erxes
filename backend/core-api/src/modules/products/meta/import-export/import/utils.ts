import { IModels } from '~/connectionResolvers';

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
