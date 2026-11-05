import { graphqlPubsub } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import {
  ITransaction,
  ITransactionDocument,
} from '@/accounting/@types/transaction';
import { setPtrStatus } from '@/accounting/db/models/utils';
import InvSaleOutCostTrs from '@/accounting/utils/invSale';
import {
  createOrUpdateTr,
  syncProductsInventory,
} from '@/accounting/utils/utils';
import { matchProductionDetailIds } from '@/inventories/utils/productionTransactionDetails';
import { prepareRealJobProduction } from './realJobProduction';

const productionKey = (transaction: ITransaction): string | undefined => {
  const data: unknown = transaction.extraData;
  if (
    data &&
    typeof data === 'object' &&
    'jobProductionKey' in data &&
    typeof data.jobProductionKey === 'string'
  )
    return data.jobProductionKey;
  return undefined;
};

const saveProduction = async (
  subdomain: string,
  models: IModels,
  userId: string,
  source: ITransactionDocument,
  docs: ITransaction[],
  previous: ITransactionDocument[],
): Promise<void> => {
  // These are ordinary root journals. Their lifecycle is managed by the group,
  // and saving directly preserves planned costs without recursive production.
  await docs.reduce<Promise<void>>(
    (pending, doc) =>
      pending.then(async () => {
        const old = previous.find(
          (row) => productionKey(row) === productionKey(doc),
        );
        const transaction = await createOrUpdateTr(models, userId, {
          ...doc,
          _id: old?._id,
          details: matchProductionDetailIds(doc.details, old?.details),
          parentId: source.parentId,
          ptrId: source.ptrId,
          ptrNumber: source.ptrNumber,
          number: source.number,
          date: source.date,
          status: source.status,
          mentionOwnerId: source.mentionOwnerId,
          mentionUserIds: source.mentionUserIds,
        });
        if (
          transaction.journal === 'invOut' ||
          transaction.journal === 'invIncome'
        ) {
          await syncProductsInventory(
            subdomain,
            transaction,
            undefined,
            transaction.journal === 'invOut' ? -1 : 1,
          );
        }
      }),
    Promise.resolve(),
  );
};

export const saveSaleTransactions = async ({
  subdomain,
  models,
  userId,
  docs,
  parentId,
  allowRealJobProduction = false,
}: {
  subdomain: string;
  models: IModels;
  userId: string;
  docs: ITransaction[];
  parentId?: string;
  allowRealJobProduction?: boolean;
}): Promise<void> => {
  const previous = parentId
    ? await models.Transactions.find({ parentId }).lean()
    : [];
  const previousProduction = previous.filter((row) => productionKey(row));
  const [sale] = docs;
  const production = allowRealJobProduction
    ? await prepareRealJobProduction(
        subdomain,
        models,
        userId,
        {
          ...sale,
          details: sale.details.map((detail) => ({
            ...detail,
            accountId: sale.followInfos.saleOutAccountId,
          })),
        },
        previous.map((row) => row._id),
      )
    : undefined;
  // Direct sync callers retain existing editable production tabs but do not
  // manufacture new stock. Event-driven resync replaces the owned rows.
  const sourceDocs = production ? docs : [...docs, ...previousProduction];
  const saved = parentId
    ? await models.Transactions.updatePTransaction(
        parentId,
        sourceDocs,
        userId,
        { skipAccountPermission: true },
      )
    : await models.Transactions.createPTransaction(sourceDocs, userId, {
        skipAccountPermission: true,
      });
  const savedSource = saved.find(
    (row) => row.journal === 'invSale' && !row.originId,
  );
  if (
    !production ||
    !savedSource ||
    (!production.docs.length && !previousProduction.length)
  )
    return;
  const source = await models.Transactions.getTransaction({
    _id: savedSource._id,
  });
  await saveProduction(
    subdomain,
    models,
    userId,
    source,
    production.docs,
    previousProduction,
  );
  // Production income must exist before the sale's normal COGS is refreshed.
  const saleCosts = new InvSaleOutCostTrs(subdomain, models, userId, source);
  await saleCosts.checkValidation();
  await saleCosts.doTrs(source);
  const transactions = await models.Transactions.find({
    parentId: source.parentId,
  }).lean();
  await setPtrStatus(models, transactions);
  const payload = {
    accountingTransactionChanged: {
      parentId: source.parentId,
      action: 'updated',
      transaction: source,
      transactions,
    },
  };
  await Promise.all([
    graphqlPubsub.publish(`accountingTransactionChanged:${subdomain}`, payload),
    graphqlPubsub.publish(
      `accountingTransactionChanged:${subdomain}:${source.parentId}`,
      payload,
    ),
  ]);
};
