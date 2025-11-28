import { IModels } from '~/connectionResolvers';

export function prepareCustomerDoc(models: IModels, row: any): any {
  const doc: any = { ...row };
  doc.createdAt = new Date();
  doc.updatedAt = new Date();

  if (doc.primaryEmail && !doc.emails) {
    doc.emails = [doc.primaryEmail];
  }
  if (doc.primaryPhone && !doc.phones) {
    doc.phones = [doc.primaryPhone];
  }
  if (doc.sex) {
    doc.sex = parseInt(doc.sex);
  }

  const pssDoc = models.Customers.calcPSS(doc);

  return {
    ...doc,
    ...pssDoc,
  };
}
