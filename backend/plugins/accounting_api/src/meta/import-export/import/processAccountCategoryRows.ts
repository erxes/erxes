import { IModels } from '~/connectionResolvers';
import {
  ACCOUNT_CATEGORY_STATUSES,
} from '~/modules/accounting/@types/constants';

export async function prepareAccountDoc(
  models: IModels,
  row: any,
) {
  const doc: any = { ...row };

  doc.createdAt = new Date();
  doc.updatedAt = new Date();

  if (!doc.code) {
    throw new Error('code is required');
  }

  if (row.parentId) {
    const parentCategory = await models.AccountCategories.findOne({
      $or: [
        { _id: row.parentId }, { code: row.parentId }]
    }).lean();
    if (!parentCategory) {
      throw new Error(`Not fount parent category (fear, code) for the line with code "${row.code}"`)
    }

    doc.parentId = parentCategory._id;
    doc.order = `${parentCategory.order}${row.code}/`
  } else {
    doc.order = `${row.code}/`
  }

  const normalize = (val: any) => String(val).toLowerCase();

  // STATUS
  doc.status = ['deleted', 0, '0'].includes(normalize(row.status))
    ? ACCOUNT_CATEGORY_STATUSES.ARCHIVED
    : ACCOUNT_CATEGORY_STATUSES.ACTIVE;

  return doc;
}

export async function processAccountCategoryRows(
  _subdomain: string,
  models: IModels,
  rows: any[],
): Promise<{ successRows: any[]; errorRows: any[] }> {
  const successRows: any[] = [];
  const errorRows: any[] = [];

  try {
    const codes = rows.map((r) => r.code).filter(Boolean);

    const existingDocs = await models.AccountCategories.find({
      ...(codes.length ? { code: { $in: codes } } : {}),
    }).lean();

    const existingByCode = new Map<string, any>();
    for (const doc of existingDocs) {
      if (doc.code) existingByCode.set(doc.code, doc);
    }

    const operations: any[] = [];
    const rowToMetaMap = new Map<any, { _id?: any; operationIndex?: number }>();

    for (const row of rows) {
      try {
        const doc = await prepareAccountDoc(models, row);
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
      const result = await models.AccountCategories.bulkWrite(operations);

      for (const [row, meta] of rowToMetaMap.entries()) {
        if (meta.operationIndex !== undefined) {
          successRows.push({
            ...row,
            _id: result.insertedIds[meta.operationIndex],
          });
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
