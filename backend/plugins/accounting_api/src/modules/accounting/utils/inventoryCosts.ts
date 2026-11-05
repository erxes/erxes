import { fixNum } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { ITransaction } from '../@types/transaction';
import { activeCost } from './inventories';

export const applyActiveInventoryCosts = async (
  models: IModels,
  doc: ITransaction,
  excludedTransactionIds: string[] = [],
) => {
  const details = (doc.details || []).map((detail) => ({ ...detail }));
  const groups = new Map<
    string,
    {
      accountId: string;
      branchId?: string;
      departmentId?: string;
      detailIndexes: number[];
    }
  >();

  details.forEach((detail, detailIndex) => {
    const branchId = detail.branchId || doc.branchId;
    const departmentId = detail.departmentId || doc.departmentId;
    const key = JSON.stringify([detail.accountId, branchId, departmentId]);
    const group = groups.get(key) || {
      accountId: detail.accountId,
      branchId,
      departmentId,
      detailIndexes: [],
    };

    group.detailIndexes.push(detailIndex);
    groups.set(key, group);
  });

  await Promise.all(
    [...groups.values()].map(async (group) => {
      const productIds = group.detailIndexes
        .map((detailIndex) => details[detailIndex].productId)
        .filter((id): id is string => Boolean(id));
      const costs = await activeCost(
        models,
        group.accountId,
        group.branchId,
        group.departmentId,
        productIds,
        excludedTransactionIds,
      );

      for (const detailIndex of group.detailIndexes) {
        const detail = details[detailIndex];
        const unitPrice = costs[detail.productId || '']?.unitCost ?? 0;
        detail.unitPrice = unitPrice;
        detail.amount = fixNum(unitPrice * (detail.count ?? 0), 4);
      }
    }),
  );

  return { ...doc, details };
};
