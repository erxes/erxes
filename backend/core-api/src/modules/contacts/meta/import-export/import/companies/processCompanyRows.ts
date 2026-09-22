import { IModels } from '~/connectionResolvers';
import {
  buildImportUpdateDoc,
  readImportBulkOutcome,
} from '~/meta/import-export/utils';
import { prepareCompanyDoc } from './utils';

export async function processCompanyRows(
  models: IModels,
  rows: any[],
): Promise<{ successRows: any[]; errorRows: any[] }> {
  const successRows: any[] = [];
  const errorRows: any[] = [];

  try {
    // ✅ rows may have "name" instead of "primaryName" (CSV header)
    const emails = rows.map((r) => r.primaryEmail).filter(Boolean);
    const names = rows.map((r) => r.primaryName || r.name).filter(Boolean);

    const existingDocs = await models.Companies.find({
      $or: [
        ...(emails.length > 0 ? [{ primaryEmail: { $in: emails } }] : []),
        ...(names.length > 0 ? [{ primaryName: { $in: names } }] : []),
      ],
    }).lean();

    const existingByEmail = new Map<string, any>();
    const existingByName = new Map<string, any>();

    for (const doc of existingDocs) {
      if (doc.primaryEmail) existingByEmail.set(doc.primaryEmail, doc);
      if (doc.primaryName) existingByName.set(doc.primaryName, doc);
    }

    const operations: any[] = [];
    const rowToMetaMap = new Map<
      any,
      { index: number; _id?: any; operationIndex: number }
    >();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      try {
        // ✅ prepareCompanyDoc is async now (tags -> tagIds, mapping, normalize)
        const doc = await prepareCompanyDoc(models, row);

        const existingDoc =
          (doc.primaryEmail && existingByEmail.get(doc.primaryEmail)) ||
          (doc.primaryName && existingByName.get(doc.primaryName));

        const operationIndex = operations.length;

        if (existingDoc) {
          operations.push({
            updateOne: {
              filter: { _id: existingDoc._id },
              update: { $set: buildImportUpdateDoc(existingDoc, doc) },
            },
          });
          rowToMetaMap.set(row, {
            index: i,
            _id: existingDoc._id,
            operationIndex,
          });
        } else {
          operations.push({
            insertOne: { document: doc },
          });
          rowToMetaMap.set(row, { index: i, operationIndex });
        }
      } catch (error: any) {
        errorRows.push({
          ...row,
          error: error?.message || 'Failed to prepare row',
        });
      }
    }

    if (operations.length > 0) {
      // unordered so one refused row does not abandon the rest of the batch
      const result = await models.Companies.bulkWrite(operations, {
        ordered: false,
      });

      for (const [row, meta] of rowToMetaMap.entries()) {
        const isInsert = !meta._id;
        const { error, insertedId } = readImportBulkOutcome({
          bulkResult: result,
          operationIndex: meta.operationIndex,
          isInsert,
        });

        if (error) {
          errorRows.push({ ...row, error });
          continue;
        }

        successRows.push({ ...row, _id: isInsert ? insertedId : meta._id });
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
