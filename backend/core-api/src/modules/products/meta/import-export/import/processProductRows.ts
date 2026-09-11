import { IModels } from '~/connectionResolvers';
import {
  buildImportUpdateDoc,
  readImportBulkOutcome,
} from '~/meta/import-export/utils';
import { prepareProductDoc } from './utils';

export async function processProductRows(
  models: IModels,
  rows: any[],
): Promise<{ successRows: any[]; errorRows: any[] }> {
  const successRows: any[] = [];
  const errorRows: any[] = [];

  try {
    const codes = rows.map((r) => r.code).filter(Boolean);

    const existingDocs = await models.Products.find({
      ...(codes.length ? { code: { $in: codes } } : {}),
    }).lean();

    const existingByCode = new Map<string, any>();
    for (const doc of existingDocs) {
      if (doc.code) existingByCode.set(doc.code, doc);
    }

    const operations: any[] = [];
    const rowToMetaMap = new Map<any, { _id?: any; operationIndex: number }>();

    for (const row of rows) {
      try {
        const doc = await prepareProductDoc(models, row);
        const existing = existingByCode.get(doc.code);

        const operationIndex = operations.length;

        if (existing) {
          operations.push({
            updateOne: {
              filter: { _id: existing._id },
              update: { $set: buildImportUpdateDoc(existing, doc) },
            },
          });
          rowToMetaMap.set(row, { _id: existing._id, operationIndex });
        } else {
          operations.push({ insertOne: { document: doc } });
          rowToMetaMap.set(row, { operationIndex });
        }
      } catch (e: any) {
        errorRows.push({
          ...row,
          error: e?.message || 'Failed to prepare row',
        });
      }
    }

    if (operations.length) {
      // unordered so one refused row does not abandon the rest of the batch
      const result = await models.Products.bulkWrite(operations, {
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
  } catch (e: any) {
    return {
      successRows: [],
      errorRows: rows.map((r) => ({
        ...r,
        error: e?.message || 'Failed to process rows',
      })),
    };
  }
}
