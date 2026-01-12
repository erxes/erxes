function prepareCompanyDoc(row: any): any {
  const doc: any = { ...row };
  doc.createdAt = new Date();
  doc.updatedAt = new Date();
  return doc;
}
