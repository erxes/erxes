import { IModels } from '~/connectionResolvers';
import {
  extractPropertiesData,
  resolveImportTagIds,
} from '~/meta/import-export/utils';

export async function prepareCustomerDoc(
  models: IModels,
  row: any,
  state: 'lead' | 'customer',
): Promise<any> {
  const doc: any = { ...row };
  await extractPropertiesData(models, doc);

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
    doc.tagIds = await resolveImportTagIds(models, 'core:customer', doc?.tags);
    delete doc.tags;
  }
  const pssDoc = models.Customers.calcPSS(doc);

  return {
    ...doc,
    ...pssDoc,
  };
}
