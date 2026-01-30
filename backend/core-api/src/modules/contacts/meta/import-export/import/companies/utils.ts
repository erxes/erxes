import { IModels } from '~/connectionResolvers';

type PrepareOptions = {
  setCreatedAt?: boolean;
};

const splitList = (value: any) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.map(String).map((s) => s.trim()).filter(Boolean);

  if (typeof value === 'string') {
    return value
      .split(/[;,]/) 
      .map((x) => x.trim())
      .filter(Boolean);
  }

  return [String(value)].filter(Boolean);
};

const generateCompanyTagIds = async (models: IModels, tags: string = '') => {
  const tagNames = splitList(tags);

  const tagIds = await Promise.all(
    tagNames.map(async (tagName: string) => {
      const tag = await models.Tags.findOneAndUpdate(
        { name: tagName, type: 'core:company' },
        { $setOnInsert: { name: tagName, type: 'core:company' } },
        { upsert: true, new: true },
      ).lean();

      return tag?._id;
    }),
  );

  return tagIds.filter(Boolean);
};

export async function prepareCompanyDoc(
  models: IModels,
  row: any,
  options: PrepareOptions = {},
): Promise<any> {
  const doc: any = { ...row };

  if (!doc.primaryName && doc.name) {
    doc.primaryName = doc.name;
  }

  if (doc.primaryEmail && !doc.emails) {
    doc.emails = [doc.primaryEmail];
  }
  if (doc.primaryPhone && !doc.phones) {
    doc.phones = [doc.primaryPhone];
  }

  doc.emails = splitList(doc.emails);
  doc.phones = splitList(doc.phones);

  const tagsValue = doc.tags || doc.tagIds;
  if (tagsValue) {
    doc.tagIds = await generateCompanyTagIds(models, String(tagsValue));
  }

  delete doc.tags;
  if (options.setCreatedAt) {
    doc.createdAt = new Date();
  }
  doc.updatedAt = new Date();

  return doc;
}
