import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import {
  ACCOUNT_JOURNALS,
  ACCOUNT_KINDS,
  ACCOUNT_STATUSES,
} from '~/modules/accounting/@types/constants';

export async function prepareAccountDoc(
  subdomain: string,
  models: IModels,
  row: any,
  addInfos: any,
) {
  const { categories, branches, departments } = addInfos;
  const doc: any = { ...row };

  doc.createdAt = new Date();
  doc.updatedAt = new Date();

  if (!doc.code) {
    throw new Error('code is required');
  }

  if (row.categoryId) {
    doc.categoryId = categories.find(
      (c) => c._id === row.categoryId || c.code === row.categoryId,
    )?._id;
  }

  if (row.branchId) {
    doc.branchId = branches.find(
      (c) => c._id === row.branchId || c.code === row.branchId,
    )?._id;
  }
  if (row.departmentId) {
    doc.departmentId = departments.find(
      (c) => c._id === row.departmentId || c.code === row.departmentId,
    )?._id;
  }

  if ([1, '1', 'active', 'ACTIVE', 'Active', true, 'true'].includes(row.kind)) {
    doc.kind = ACCOUNT_KINDS.ACTIVE;
  } else {
    doc.kind = ACCOUNT_KINDS.PASSIVE;
  }

  if (
    [1, '1', 'temp', 'TEMP', 'Temp', true, 'true', 'True'].includes(row.isTemp)
  ) {
    doc.kind = true;
  } else {
    doc.kind = false;
  }
  if (
    [1, '1', 'OutBalance', 'Out', true, 'true', 'True'].includes(
      row.isOutBalance,
    )
  ) {
    doc.kind = true;
  } else {
    doc.kind = false;
  }
  if (['deleted', 'Deleted', 'DELETED'].includes(row.status)) {
    doc.status = ACCOUNT_STATUSES.DELETED;
  } else {
    doc.status = ACCOUNT_STATUSES.ACTIVE;
  }

  if (ACCOUNT_JOURNALS.ALL.includes(row.journal)) {
    doc.journal = row.jouranl;
  }
  {
    doc.jouranl = ACCOUNT_JOURNALS.MAIN;
  }

  return doc;
}

export async function processAccountRows(
  subdomain: string,
  models: IModels,
  rows: any[],
): Promise<{ successRows: any[]; errorRows: any[] }> {
  const successRows: any[] = [];
  const errorRows: any[] = [];

  try {
    const codes = rows.map((r) => r.code).filter(Boolean);
    const categoryIds = rows.map((r) => r.categoryId).filter(Boolean);
    const branchIds = rows.map((r) => r.branchId).filter(Boolean);
    const departmentIds = rows.map((r) => r.departmentId).filter(Boolean);

    const categories = await models.AccountCategories.find({
      $or: [{ _id: { $in: categoryIds } }, { code: { $in: categoryIds } }],
    });
    const branches = branchIds.length
      ? await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          module: 'branches',
          action: 'find',
          defaultValue: {},
          input: {
            query: {
              $or: [{ _id: { $in: branchIds } }, { code: { $in: branchIds } }],
            },
          },
        })
      : [];
    const departments = departmentIds.length
      ? await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          module: 'branches',
          action: 'find',
          defaultValue: {},
          input: {
            query: {
              $or: [
                { _id: { $in: departmentIds } },
                { code: { $in: departmentIds } },
              ],
            },
          },
        })
      : [];

    const existingDocs = await models.Accounts.find({
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
        const doc = await prepareAccountDoc(subdomain, models, row, {
          categories,
          branches,
          departments,
        });
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
      const result = await models.Accounts.bulkWrite(operations);

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
