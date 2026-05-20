import { IModels } from '~/connectionResolvers';
import { createRelations, getNewOrder } from '~/modules/sales/utils';
import { buildDealImportDoc } from './utils';

export async function processDealRows(
  models: IModels,
  subdomain: string,
  rows: any[],
  userId: string,
): Promise<{ successRows: any[]; errorRows: any[] }> {
  const successRows: any[] = [];
  const errorRows: any[] = [];

  const stageIds = [
    ...new Set(
      rows.map((row) => String(row.stageId || '').trim()).filter(Boolean),
    ),
  ];

  const stages = await models.Stages.find({ _id: { $in: stageIds } })
    .select('_id')
    .lean();
  const stageIdSet = new Set(stages.map((stage) => String(stage._id)));

  for (const row of rows) {
    try {
      const doc = buildDealImportDoc(row, userId);

      if (!stageIdSet.has(doc.stageId)) {
        throw new Error(`Stage "${doc.stageId}" was not found`);
      }

      const deal = await models.Deals.createDeal({
        ...doc,
        order: await getNewOrder({
          collection: models.Deals,
          stageId: doc.stageId,
        }),
      });

      await createRelations(subdomain, {
        dealId: deal._id,
        customerIds: doc.customerIds,
        companyIds: doc.companyIds,
      });

      successRows.push({ ...row, _id: deal._id });
    } catch (error: any) {
      errorRows.push({
        ...row,
        error: error?.message || 'Failed to import deal row',
      });
    }
  }

  return { successRows, errorRows };
}
