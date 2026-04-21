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
      throw new Error(`Parent category (by _id or code) not found for line with code "${row.code}"`)
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

    for (const row of rows) {
      try {
        const doc = await prepareAccountDoc(models, row);
        const existing = existingByCode.get(doc.code);

        if (existing) {
          await models.AccountCategories.updateOne(
            { _id: existing._id },
            { $set: { ...doc, updatedAt: new Date() } },
          );
          successRows.push({ ...row, _id: existing._id });
          existingByCode.set(doc.code, { ...existing, ...doc, _id: existing._id });
        } else {

          const newCat = await models.AccountCategories.create({ ...doc });
          successRows.push({ ...row, _id: newCat._id });
          existingByCode.set(doc.code, { ...doc, _id: newCat._id });
        }
      } catch (e: any) {
        errorRows.push({
          ...row,
          error: e?.message || 'Failed to prepare row',
        });
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
