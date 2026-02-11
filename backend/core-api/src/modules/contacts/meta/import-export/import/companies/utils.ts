import { IModels } from '~/connectionResolvers';

const generateCompanyTagIds = async (models: IModels, tags: string = '') => {
  const tagNames = tags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const tagIds = await Promise.all(
    tagNames.map(async (tagName: string) => {
      const existingTag = await models.Tags.findOne({
        name: tagName,
        type: `core:company`,
      }).lean();

      if (!existingTag) {
        const createdTag = await models.Tags.createTag({
          name: tagName,
          type: `core:company`,
        });
        return createdTag._id;
      }

      return existingTag._id;
    }),
  );

  return tagIds;
};

export async function prepareCompanyDoc(models: IModels, row: any): Promise<any> {
  const doc: any = { ...row };

  doc.createdAt = new Date();
  doc.updatedAt = new Date();

  if (!doc.primaryName && doc.name) {
    doc.primaryName = doc.name;
    delete doc.name; 
  }

  // normalize emails/phones like customer
  if (doc.primaryEmail && !doc.emails) {
    doc.emails = [doc.primaryEmail];
  }
  if (doc.primaryPhone && !doc.phones) {
    doc.phones = [doc.primaryPhone];
  }

  // If CSV provides "Emails"/"Phones" as string, normalize
  if (typeof doc.emails === 'string') {
    doc.emails = doc.emails.split(/[;,]/).map((x) => x.trim()).filter(Boolean);
  }
  if (typeof doc.phones === 'string') {
    doc.phones = doc.phones.split(/[;,]/).map((x) => x.trim()).filter(Boolean);
  }

  // tags -> tagIds (company type)
  if (doc.tags) {
    doc.tagIds = await generateCompanyTagIds(models, doc.tags);
    delete doc.tags;
  }

  return doc;
}
