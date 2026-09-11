import { IModels } from '~/connectionResolvers';
import {
  extractPropertiesData,
  resolveImportTagIds,
} from '~/meta/import-export/utils';

export async function prepareCompanyDoc(
  models: IModels,
  row: any,
): Promise<any> {
  const doc: any = { ...row };
  await extractPropertiesData(models, doc);

  doc.createdAt = new Date();
  doc.updatedAt = new Date();

  if (!doc.primaryName && doc.name) {
    doc.primaryName = doc.name;
    delete doc.name;
  }

  // Trim code so trailing/leading spaces don't break exact code lookups
  if (typeof doc.code === 'string') {
    doc.code = doc.code.trim();
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
    doc.emails = doc.emails
      .split(/[;,]/)
      .map((x) => x.trim())
      .filter(Boolean);
  }
  if (typeof doc.phones === 'string') {
    doc.phones = doc.phones
      .split(/[;,]/)
      .map((x) => x.trim())
      .filter(Boolean);
  }

  // tags -> tagIds (company type)
  if (doc.tags) {
    doc.tagIds = await resolveImportTagIds(models, 'core:company', doc.tags);
    delete doc.tags;
  }

  return doc;
}
