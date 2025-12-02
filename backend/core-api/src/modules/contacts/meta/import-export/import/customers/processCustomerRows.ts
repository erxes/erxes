import { IModels } from '~/connectionResolvers';
import { prepareCustomerDoc } from './utils';
export async function processCustomerRows(
  models: IModels,
  rows: any[],
  state: 'lead' | 'customer',
): Promise<{ successRows: any[]; errorRows: any[] }> {
  console.log('processCustomerRows', rows);
  const successRows: any[] = [];
  const errorRows: any[] = [];

  try {
    const emails = rows.map((r) => r.primaryEmail).filter((email) => email);
    const phones = rows.map((r) => r.primaryPhone).filter((phone) => phone);

    const existingDocs = await models.Customers.find({
      $or: [
        ...(emails.length > 0 ? [{ primaryEmail: { $in: emails } }] : []),
        ...(phones.length > 0 ? [{ primaryPhone: { $in: phones } }] : []),
      ],
    }).lean();

    const existingByEmail = new Map<string, any>();
    const existingByPhone = new Map<string, any>();

    for (const doc of existingDocs) {
      if (doc.primaryEmail) {
        existingByEmail.set(doc.primaryEmail, doc);
      }
      if (doc.primaryPhone) {
        existingByPhone.set(doc.primaryPhone, doc);
      }
    }

    const operations: any[] = [];
    const rowToMetaMap = new Map<
      any,
      { index: number; _id?: any; operationIndex?: number }
    >();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const doc = prepareCustomerDoc(models, row, state);

        const existingDoc =
          (doc.primaryEmail && existingByEmail.get(doc.primaryEmail)) ||
          (doc.primaryPhone && existingByPhone.get(doc.primaryPhone));

        if (existingDoc) {
          operations.push({
            updateOne: {
              filter: { _id: existingDoc._id },
              update: { $set: { ...doc, updatedAt: new Date() } },
            },
          });
          rowToMetaMap.set(row, { index: i, _id: existingDoc._id });
        } else {
          const operationIndex = operations.length;
          operations.push({
            insertOne: { document: doc },
          });
          rowToMetaMap.set(row, { index: i, operationIndex });
        }
      } catch (error: any) {
        errorRows.push({
          ...row,
          error: error.message || 'Failed to prepare row',
        });
      }
    }

    console.log('operations', JSON.stringify(operations));
    if (operations.length > 0) {
      const result = await models.Customers.bulkWrite(operations);

      for (const [row, meta] of rowToMetaMap.entries()) {
        if (meta.operationIndex !== undefined) {
          const insertedId = result.insertedIds[meta.operationIndex];
          successRows.push({ ...row, _id: insertedId });
        } else {
          successRows.push({ ...row, _id: meta._id });
        }
      }
    }

    return { successRows, errorRows };
  } catch (error) {
    return {
      successRows: [],
      errorRows: rows.map((row) => ({
        ...row,
        error: error.message || 'Failed to process rows',
      })),
    };
  }
}
