import { IModels } from '~/connectionResolvers';

const generateTagIds = async (models: IModels, tags: string = '') => {
  const tagNames = tags.split(',');

  const tagIds = await Promise.all(
    tagNames.map(async (tagName: string) => {
      const existingTag = await models.Tags.findOne({
        name: tagName,
        type: `core:customer`,
      }).lean();

      if (!existingTag) {
        const createdTag = await models.Tags.createTag({
          name: tagName,
          type: `core:customer`,
        });
        return createdTag._id;
      }

      return existingTag?._id;
    }),
  );
  return tagIds;
};

export async function prepareCustomerDoc(
  models: IModels,
  row: any,
  state: 'lead' | 'customer',
): Promise<any> {
  const doc: any = { ...row };
  doc.createdAt = new Date();
  doc.updatedAt = new Date();
  doc.state = state;
  if (doc.primaryEmail && !doc.emails) {
    doc.emails = [doc.primaryEmail];
  }
  if (doc.primaryPhone && !doc.phones) {
    doc.phones = [doc.primaryPhone];
  }
  if (doc.sex) {
    doc.sex = Number.parseInt(doc.sex);
  }
  if (doc?.tags) {
    doc.tagIds = await generateTagIds(models, doc?.tags);
  }
  const pssDoc = models.Customers.calcPSS(doc);

  return {
    ...doc,
    ...pssDoc,
  };
}
