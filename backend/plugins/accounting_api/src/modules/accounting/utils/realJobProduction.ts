import { fixNum } from 'erxes-api-shared/utils';
import { nanoid } from 'nanoid';
import { IModels } from '~/connectionResolvers';
import { IJobExecutionItem } from '../../inventories/@types/jobExecutions';
import { IJobDocument } from '../../inventories/@types/jobs';
import { buildJobExecutionTransactions } from '../../inventories/utils/jobExecutionTransactions';
import { matchProductionDetailIds } from '../../inventories/utils/productionTransactionDetails';
import {
  executionJobsInBaseUnits,
  getExecutionProductUnits,
} from '../../inventories/utils/jobExecutionUnits';
import {
  ITransaction,
  ITransactionDocument,
  ITrDetail,
} from '../@types/transaction';
import { TR_FOLLOW_TYPES } from '../@types/constants';
import { activeCost } from './inventories';
import { assertCanWriteTransactionAccounts } from './trPermissions';
import {
  createOrUpdateTr,
  getSingleJournalByAccount,
  removeSyncProductsInventory,
  syncProductsInventory,
} from './utils';

export const REAL_JOB_FOLLOW_TYPES = {
  OUT: 'realJobOut',
  INCOME: 'realJobIncome',
  COST: 'realJobCost',
};
const followTypes = Object.values(REAL_JOB_FOLLOW_TYPES);

export interface RealJobProduction {
  details: ITrDetail[];
  docs: ITransaction[];
  previous: ITransactionDocument[];
}

interface ProductionLocation {
  accountId: string;
  branchId?: string;
  departmentId?: string;
  indexes: number[];
}

interface ProductionPlan {
  subdomain: string;
  models: IModels;
  inventoryDoc: ITransaction;
  excludedIds: string[];
  details: ITrDetail[];
  docs: ITransaction[];
}

const inventoryMultiplier = (transaction: ITransaction) => {
  if (transaction.originType === REAL_JOB_FOLLOW_TYPES.OUT) return -1;
  if (transaction.originType === REAL_JOB_FOLLOW_TYPES.INCOME) return 1;
  return 0;
};

export const isRealJobFollow = (transaction: ITransaction): boolean =>
  followTypes.includes(transaction.originType || '');

const scaleProductionJob = async (
  subdomain: string,
  template: IJobDocument,
  productId: string,
  shortage: number,
): Promise<IJobExecutionItem> => {
  const job: IJobExecutionItem = {
    _id: nanoid(),
    jobId: template._id,
    jobName: template.name,
    quantity: 1,
    inputs: template.inputs,
    outputs: template.outputs,
    laborCosts: template.laborCosts ?? [],
    overheadCosts: template.overheadCosts ?? [],
  };
  const { products, units } = await getExecutionProductUnits(subdomain, [job]);
  const [base] = executionJobsInBaseUnits([job], products, units);
  const outputCount = base.outputs
    .filter((row) => row.productId === productId)
    .reduce((sum, row) => sum + row.quantity, 0);
  if (!Number.isFinite(outputCount) || outputCount <= 0)
    throw new Error('Real job output quantity must be positive');
  const quantity = shortage / outputCount;
  const scaled: IJobExecutionItem = {
    ...base,
    quantity,
    inputs: base.inputs.map((row) => ({
      ...row,
      quantity: row.quantity * quantity,
    })),
    outputs: base.outputs.map((row) => ({
      ...row,
      quantity: row.quantity * quantity,
    })),
    laborCosts: base.laborCosts.map((row) => ({
      ...row,
      amount: fixNum(row.amount * quantity, 4),
    })),
    overheadCosts: base.overheadCosts.map((row) => ({
      ...row,
      amount: fixNum(row.amount * quantity, 4),
    })),
  };
  return scaled;
};

const productionExpenseJournals = async (
  models: IModels,
  accountId: string,
  scaled: IJobExecutionItem,
): Promise<Map<string, string>> => {
  const expenseIds = [
    ...new Set(
      [...scaled.laborCosts, ...scaled.overheadCosts].map(
        (row) => row.accountId,
      ),
    ),
  ];
  const accounts = await Promise.all(
    [accountId, ...expenseIds].map((_id) =>
      models.Accounts.getAccount({
        _id,
        status: 'active',
        isOutBalance: false,
      }),
    ),
  );
  const inventory = accounts[0];
  if (inventory.journal !== 'inventory')
    throw new Error('Real job requires an inventory account');
  const journals = new Map(
    accounts.slice(1).map((account) => {
      if (
        !['main', 'tax', 'cash', 'bank', 'debt'].includes(account.journal) ||
        account.currency !== inventory.currency
      )
        throw new Error(
          'Real job cost accounts must support single journals in the inventory currency',
        );
      return [
        account._id,
        getSingleJournalByAccount(account.journal, account.kind),
      ];
    }),
  );
  return journals;
};

const costProductionGroup = async (
  {
    subdomain,
    models,
    inventoryDoc,
    excludedIds,
    details,
    docs,
  }: ProductionPlan,
  group: ProductionLocation,
): Promise<void> => {
  const stock: Awaited<ReturnType<typeof activeCost>> = {};
  const load = async (ids: string[]) => {
    const missing = [...new Set(ids)].filter((id) => id && !stock[id]);
    if (!missing.length) return;
    Object.assign(
      stock,
      await activeCost(
        models,
        group.accountId,
        group.branchId,
        group.departmentId,
        missing,
        excludedIds,
      ),
    );
  };
  await load(group.indexes.map((index) => details[index].productId || ''));
  const apply = (detail: ITrDetail, multiplier: number) => {
    if (!detail.productId) return;
    const current = stock[detail.productId];
    if (!current)
      throw new Error(`Product cost not loaded: ${detail.productId}`);
    current.remainder = fixNum(
      current.remainder + multiplier * (detail.count ?? 0),
      6,
    );
    current.totalCost = fixNum(
      current.totalCost + multiplier * detail.amount,
      4,
    );
    current.unitCost = current.totalCost / (current.remainder || 1);
  };
  await group.indexes.reduce<Promise<void>>(
    (previousRow, index) =>
      previousRow.then(async () => {
        const detail = details[index];
        if (!detail.productId) return;
        const count = detail.count ?? 0;
        const shortage = fixNum(count - stock[detail.productId].remainder, 6);
        if (count > 0 && shortage > 0) {
          const template = await models.Jobs.findOne({
            status: 'active',
            durationType: 'real',
            'outputs.productId': detail.productId,
          })
            .sort({ modifiedAt: -1, _id: -1 })
            .lean();
          if (template) {
            const scaled = await scaleProductionJob(
              subdomain,
              template,
              detail.productId,
              shortage,
            );
            await load(
              [...scaled.inputs, ...scaled.outputs].map((row) => row.productId),
            );
            const journals = await productionExpenseJournals(
              models,
              group.accountId,
              scaled,
            );
            const generated = buildJobExecutionTransactions(
              {
                _id: scaled._id,
                date: inventoryDoc.date,
                jobs: [scaled],
                inputAccountId: group.accountId,
                outputAccountId: group.accountId,
                inputBranchId: group.branchId,
                outputBranchId: group.branchId,
                inputDepartmentId: group.departmentId,
                outputDepartmentId: group.departmentId,
              },
              stock,
              journals,
            );
            for (const generatedDoc of generated) {
              let originType = REAL_JOB_FOLLOW_TYPES.COST;
              if (generatedDoc.journal === 'invOut')
                originType = REAL_JOB_FOLLOW_TYPES.OUT;
              if (generatedDoc.journal === 'invIncome')
                originType = REAL_JOB_FOLLOW_TYPES.INCOME;
              const next: ITransaction = {
                ...generatedDoc,
                status: inventoryDoc.status,
                contentType: inventoryDoc.contentType,
                contentId: inventoryDoc.contentId,
                originType,
                description:
                  originType === REAL_JOB_FOLLOW_TYPES.COST
                    ? generatedDoc.description
                    : inventoryDoc.description,
              };
              docs.push(next);
              const multiplier = inventoryMultiplier(next);
              if (multiplier)
                next.details.forEach((row) => apply(row, multiplier));
            }
          }
        }
        detail.unitPrice = stock[detail.productId].unitCost;
        detail.amount = fixNum(detail.unitPrice * count, 4);
        apply(detail, -1);
      }),
    Promise.resolve(),
  );
};

// Only the source owns inventory synchronization; generated rows are not saved
// through commonSave, so material shortages cannot recursively run more jobs.
export const prepareRealJobProduction = async (
  subdomain: string,
  models: IModels,
  userId: string,
  inventoryDoc: ITransaction,
  oldSource?: ITransactionDocument,
): Promise<RealJobProduction> => {
  const oldLinked = oldSource
    ? await models.Transactions.find({
        originId: oldSource._id,
        originType: { $in: [...followTypes, TR_FOLLOW_TYPES.INV_SALE_OUT] },
      }).lean()
    : [];
  const previous = oldLinked.filter(isRealJobFollow);
  const excludedIds = [
    ...(oldSource ? [oldSource._id] : []),
    ...oldLinked.map((transaction) => transaction._id),
  ];
  const details = inventoryDoc.details.map((detail) => ({ ...detail }));
  const groups = new Map<string, ProductionLocation>();
  details.forEach((detail, index) => {
    const branchId = detail.branchId || inventoryDoc.branchId;
    const departmentId = detail.departmentId || inventoryDoc.departmentId;
    const key = JSON.stringify([detail.accountId, branchId, departmentId]);
    const group = groups.get(key) ?? {
      accountId: detail.accountId,
      branchId,
      departmentId,
      indexes: [],
    };
    group.indexes.push(index);
    groups.set(key, group);
  });
  const docs: ITransaction[] = [];
  const plan: ProductionPlan = {
    subdomain,
    models,
    inventoryDoc,
    excludedIds,
    details,
    docs,
  };
  await [...groups.values()].reduce<Promise<void>>(
    (pending, group) => pending.then(() => costProductionGroup(plan, group)),
    Promise.resolve(),
  );
  // Consolidate repeated products per location, preserving each job's allocated
  // amounts instead of redistributing a merged recipe's output costs.
  const merged = new Map<string, ITransaction>();
  for (const doc of docs) {
    const key = JSON.stringify([
      doc.originType,
      doc.branchId,
      doc.departmentId,
      doc.originType === REAL_JOB_FOLLOW_TYPES.COST
        ? [doc.details[0].accountId, doc.description]
        : doc.details[0].accountId,
    ]);
    const target = merged.get(key) ?? { ...doc, originSubId: key, details: [] };
    merged.set(key, target);
    for (const row of doc.details) {
      const existing = target.details.find(
        (item) =>
          item.accountId === row.accountId && item.productId === row.productId,
      );
      if (!existing) target.details.push({ ...row });
      else {
        existing.count = (existing.count ?? 0) + (row.count ?? 0);
        existing.amount = fixNum(existing.amount + row.amount, 4);
        if (existing.count)
          existing.unitPrice = existing.amount / existing.count;
      }
    }
  }
  const result = [...merged.values()];
  if (result.length)
    await assertCanWriteTransactionAccounts({ models, docs: result, userId });
  return { details, docs: result, previous };
};

export const syncRealJobProduction = async (
  subdomain: string,
  models: IModels,
  userId: string,
  source: ITransactionDocument,
  production: RealJobProduction,
): Promise<ITransactionDocument[]> => {
  const ptrId = production.previous[0]?.ptrId || nanoid();
  const retained = new Set<string>();
  const saved: ITransactionDocument[] = [];
  await production.docs.reduce<Promise<void>>(
    (pending, doc) =>
      pending.then(async () => {
        const old = production.previous.find(
          (row) =>
            row.originSubId === doc.originSubId && !retained.has(row._id),
        );
        if (old) retained.add(old._id);
        const details = matchProductionDetailIds(doc.details, old?.details);
        const transaction = await createOrUpdateTr(
          models,
          userId,
          {
            ...doc,
            details,
            ptrId,
            parentId: source.parentId,
            originId: source._id,
            number: source.number,
            date: source.date,
            status: source.status,
            mentionOwnerId: source.mentionOwnerId,
            mentionUserIds: source.mentionUserIds,
          },
          old,
        );
        const multiplier = inventoryMultiplier(transaction);
        if (multiplier)
          await syncProductsInventory(subdomain, transaction, old, multiplier);
        saved.push(transaction);
      }),
    Promise.resolve(),
  );
  const removed = production.previous.filter((row) => !retained.has(row._id));
  await reverseProduction(subdomain, removed);
  if (removed.length)
    await models.Transactions.deleteMany({
      _id: { $in: removed.map((row) => row._id) },
    });
  return saved;
};

const reverseProduction = async (
  subdomain: string,
  rows: ITransactionDocument[],
) =>
  rows.reduce<Promise<void>>(
    (pending, row) =>
      pending.then(async () => {
        const multiplier = inventoryMultiplier(row);
        if (multiplier)
          await removeSyncProductsInventory(subdomain, row, multiplier);
      }),
    Promise.resolve(),
  );

export const removeRealJobProduction = async (
  subdomain: string,
  models: IModels,
  sourceId: string,
): Promise<void> => {
  const rows = await models.Transactions.find({
    originId: sourceId,
    originType: { $in: followTypes },
  }).lean();
  await reverseProduction(subdomain, rows);
  if (rows.length)
    await models.Transactions.deleteMany({
      _id: { $in: rows.map((row) => row._id) },
    });
};
