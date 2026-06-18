import { IModels } from '~/connectionResolvers';
import { prepareProductDoc } from './utils';

export async function processProductRows(
  models: IModels,
  rows: any[],
): Promise<{ successRows: any[]; errorRows: any[] }> {
  const successRows: any[] = [];
  const errorRows: any[] = [];

  try {
    const codes = rows
      .map((r) => (r.code != null ? String(r.code).trim() : ''))
      .filter(Boolean);

    const existingByCode = new Map<string, any>();
    if (codes.length) {
      const existingDocs = await models.Products.find({
        code: { $in: codes },
      }).lean();
      for (const doc of existingDocs) {
        if (doc.code) existingByCode.set(String(doc.code).trim(), doc);
      }
    }

    const operations: any[] = [];
    const rowToMetaMap = new Map<any, { _id?: any; operationIndex?: number }>();

    const isBlankRow = (row: any) =>
      Object.values(row).every(
        (v) => v === undefined || v === null || v === '' || v === '-',
      );

    for (const row of rows) {
      if (isBlankRow(row)) continue;
      try {
        const doc = await prepareProductDoc(models, row);
        const existing = existingByCode.get(doc.code);

        if (existing) {
          operations.push({
            updateOne: {
              filter: { _id: existing._id },
              update: { $set: { ...doc, updatedAt: new Date() } },
            },
          });
          rowToMetaMap.set(row, { _id: existing._id });
        } else {
          const opIndex = operations.length;
          operations.push({ insertOne: { document: doc } });
          rowToMetaMap.set(row, { operationIndex: opIndex });
        }
      } catch (e: any) {
        errorRows.push({
          ...row,
          error: e?.message || 'Failed to prepare row',
        });
      }
    }

    if (operations.length) {
      let bulkResult: any;
      const failedOpIndices = new Set<number>();

      try {
        bulkResult = await models.Products.bulkWrite(operations, {
          ordered: false,
        });
      } catch (e: any) {
        const isBulkError =
          e?.name === 'MongoBulkWriteError' || e?.name === 'BulkWriteError';
        if (!isBulkError) throw e;

        bulkResult = e.result ?? e;
        for (const writeError of e.writeErrors ?? []) {
          const idx = writeError.index ?? writeError.err?.index;
          if (idx != null) failedOpIndices.add(idx);
        }
      }

      for (const [row, meta] of rowToMetaMap.entries()) {
        if (meta.operationIndex !== undefined) {
          if (failedOpIndices.has(meta.operationIndex)) {
            errorRows.push({
              ...row,
              error: 'Write failed (duplicate or invalid data)',
            });
          } else {
            successRows.push({
              ...row,
              _id: bulkResult?.insertedIds?.[meta.operationIndex],
            });
          }
        } else {
          successRows.push({ ...row, _id: meta._id });
        }
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
