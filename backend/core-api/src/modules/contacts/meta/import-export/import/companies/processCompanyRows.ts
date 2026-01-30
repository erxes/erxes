import { IModels } from '~/connectionResolvers';
import { prepareCompanyDoc } from './utils';

export async function processCompanyRows(
  models: IModels,
  rows: any[],
): Promise<{ successRows: any[]; errorRows: any[] }> {
  const successRows: any[] = [];
  const errorRows: any[] = [];

  try {
    const emails = rows.map((r) => r.primaryEmail).filter(Boolean);
    const names = rows.map((r) => r.primaryName || r.name).filter(Boolean);

    const existingDocs = await models.Companies.find({
      $or: [
        ...(emails.length ? [{ primaryEmail: { $in: emails } }] : []),
        ...(names.length ? [{ primaryName: { $in: names } }] : []),
      ],
    }).lean();

    const existingByEmail = new Map<string, any>();
    const existingByName = new Map<string, any>();

    for (const doc of existingDocs) {
      if (doc.primaryEmail) existingByEmail.set(doc.primaryEmail, doc);
      if (doc.primaryName) existingByName.set(doc.primaryName, doc);
    }

    const operations: any[] = [];
    const rowToMetaMap = new Map<any, { _id?: any; operationIndex?: number }>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      try {
        const normalizedName = row.primaryName || row.name;
        const normalizedEmail = row.primaryEmail;

        const existingDoc =
          (normalizedEmail && existingByEmail.get(normalizedEmail)) ||
          (normalizedName && existingByName.get(normalizedName));
        const doc = await prepareCompanyDoc(models, row, {
          setCreatedAt: !existingDoc,
        });

        if (existingDoc) {
          operations.push({
            updateOne: {
              filter: { _id: existingDoc._id },
              update: {
                $set: {
                  ...doc,
                  updatedAt: new Date(),
                },
              },
            },
          });
          rowToMetaMap.set(row, { _id: existingDoc._id });
        } else {
          const operationIndex = operations.length;
          operations.push({
            insertOne: { document: doc },
          });
          rowToMetaMap.set(row, { operationIndex });
        }
      } catch (error: any) {
        errorRows.push({
          ...row,
          error: error?.message || 'Failed to prepare row',
        });
      }
    }

    if (operations.length > 0) {
      const result = await models.Companies.bulkWrite(operations);

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
  } catch (error: any) {
    return {
      successRows: [],
      errorRows: rows.map((row) => ({
        ...row,
        error: error?.message || 'Failed to process rows',
      })),
    };
  }
}
