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

  const normalize = (val: any) => String(val).toLowerCase();

  doc.kind = ['1', 'true', 'active'].includes(normalize(row.kind))
    ? ACCOUNT_KINDS.ACTIVE
    : ACCOUNT_KINDS.PASSIVE;

  // IS TEMP
  doc.isTemp = ['1', 1, 'temp'].includes(normalize(row.isTemp));

  // IS OUT BALANCE
  doc.isOutBalance = [1, '1', 'outbalance', 'out'].includes(
    normalize(row.isOutBalance),
  );

  // STATUS
  doc.status = ['deleted', 1, '1'].includes(normalize(row.status))
    ? ACCOUNT_STATUSES.DELETED
    : ACCOUNT_STATUSES.ACTIVE;

  // JOURNAL
  if (ACCOUNT_JOURNALS.ALL.includes(row.journal)) {
    doc.journal = row.journal;
  } else {
    doc.journal = ACCOUNT_JOURNALS.MAIN;
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
    const codes: string[] = [];
    const categoryIds: string[] = [];
    const branchIds: string[] = [];
    const departmentIds: string[] = [];
    for (const row of rows) {
      if (row.code) codes.push(row.code);
      if (row.categoryId) categoryIds.push(row.categoryId);
      if (row.branchId) branchIds.push(row.branchId);
      if (row.departmentId) departmentIds.push(row.departmentId);
    }

    const categories = await models.AccountCategories.find(
      {
        $or: [{ _id: { $in: categoryIds } }, { code: { $in: categoryIds } }],
      },
      { _id: 1, code: 1 },
    );
    const branches = branchIds.length
      ? await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          module: 'branches',
          action: 'find',
          defaultValue: [],
          input: {
            query: {
              $or: [{ _id: { $in: branchIds } }, { code: { $in: branchIds } }],
            },
            fields: { _id: 1, code: 1 },
          },
        })
      : [];
    const departments = departmentIds.length
      ? await sendTRPCMessage({
          subdomain,
          pluginName: 'core',
          module: 'departments',
          action: 'find',
          defaultValue: [],
          input: {
            query: {
              $or: [
                { _id: { $in: departmentIds } },
                { code: { $in: departmentIds } },
              ],
            },
            fields: { _id: 1, code: 1 },
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
