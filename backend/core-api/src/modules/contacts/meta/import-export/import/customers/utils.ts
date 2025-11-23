export function prepareCustomerDoc(row: any): any {
  const doc: any = { ...row };
  doc.createdAt = new Date();
  doc.updatedAt = new Date();

  if (doc.primaryEmail && !doc.emails) {
    doc.emails = [doc.primaryEmail];
  }
  if (doc.primaryPhone && !doc.phones) {
    doc.phones = [doc.primaryPhone];
  }

  return doc;
}
