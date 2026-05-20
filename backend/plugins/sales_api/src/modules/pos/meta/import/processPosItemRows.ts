import { IModels } from '~/connectionResolvers';
import { buildLookupMaps, buildPosOrderDoc, getOrderGroupKey } from './utils';

export async function processPosItemRows(
  models: IModels,
  subdomain: string,
  rows: any[],
  userId: string,
): Promise<{ successRows: any[]; errorRows: any[] }> {
  const successRows: any[] = [];
  const errorRows: any[] = [];
  const lookups = await buildLookupMaps(models, subdomain, rows);
  const groupedRows = new Map<string, any[]>();

  for (const row of rows) {
    const key = getOrderGroupKey(row);
    groupedRows.set(key, [...(groupedRows.get(key) || []), row]);
  }

  for (const groupRows of groupedRows.values()) {
    try {
      const doc = await buildPosOrderDoc(models, groupRows, lookups, userId);
      const { newOrder } = await models.PosOrders.createOrUpdate(doc as any);

      for (const row of groupRows) {
        successRows.push({
          ...row,
          _id: newOrder._id,
        });
      }
    } catch (error: any) {
      for (const row of groupRows) {
        errorRows.push({
          ...row,
          error: error?.message || 'Failed to import POS item row',
        });
      }
    }
  }

  return { successRows, errorRows };
}
