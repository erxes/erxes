import { fixNum } from 'erxes-api-shared/utils';
import { nanoid } from 'nanoid';
import { IJobExecution, IJobExecutionItem } from '../@types/jobExecutions';
import { ITransaction } from '../../accounting/@types/transaction';
import { matchProductionDetailIds } from './productionTransactionDetails';

const buildJobTransactions = (
  execution: Omit<IJobExecution, 'jobs'> & IJobExecutionItem & { _id: string },
  costs: Record<string, { unitCost: number }>,
  journals: ReadonlyMap<string, string>,
  inputAmount: (productId: string, count: number, unitPrice: number) => number,
): ITransaction[] => {
  const inputDetails = execution.inputs.map((item) => {
    const count = item.quantity;
    if (!Number.isFinite(count) || count <= 0)
      throw new Error('Product quantity must be finite and positive');
    const unitPrice = costs[item.productId]?.unitCost ?? 0;
    if (!Number.isFinite(unitPrice) || unitPrice < 0)
      throw new Error('Invalid input unit cost');
    return {
      _id: nanoid(),
      accountId: execution.inputAccountId,
      productId: item.productId,
      count,
      unitPrice,
      amount: inputAmount(item.productId, count, unitPrice),
    };
  });
  const expenses = [...execution.laborCosts, ...execution.overheadCosts].filter(
    (row) => row.amount > 0,
  );
  const total = fixNum(
    inputDetails.reduce((sum, row) => sum + row.amount, 0) +
      expenses.reduce((sum, row) => sum + row.amount, 0),
    4,
  );
  if (!Number.isFinite(total) || total < 0)
    throw new Error('Production cost must be finite and non-negative');
  const ratioTotal = execution.outputs.reduce(
    (sum, row) => sum + (row.costRatio ?? 0),
    0,
  );
  if (!Number.isFinite(ratioTotal) || ratioTotal <= 0)
    throw new Error('Output ratios must have a positive total');
  let allocated = 0;
  let cumulativeRatio = 0;
  const outputDetails = execution.outputs.map((item, index) => {
    const count = item.quantity;
    if (!Number.isFinite(count) || count <= 0)
      throw new Error('Product quantity must be finite and positive');
    cumulativeRatio += item.costRatio ?? 0;
    const target =
      index === execution.outputs.length - 1
        ? total
        : fixNum(total * (cumulativeRatio / ratioTotal), 4);
    const amount = fixNum(target - allocated, 4);
    allocated = fixNum(allocated + amount, 4);
    const unitPrice = amount / count;
    if (!Number.isFinite(unitPrice))
      throw new Error('Output unit cost must be finite');
    return {
      _id: nanoid(),
      accountId: execution.outputAccountId,
      productId: item.productId,
      count,
      unitPrice,
      amount,
    };
  });
  const common = {
    date: execution.date,
    status: 'complete',
    description: execution.description || execution._id,
    contentType: 'jobExecution',
    contentId: execution._id,
  };
  return [
    {
      ...common,
      journal: 'invOut',
      side: 'ct',
      branchId: execution.inputBranchId,
      departmentId: execution.inputDepartmentId,
      details: inputDetails,
    },
    {
      ...common,
      journal: 'invIncome',
      side: 'dt',
      branchId: execution.outputBranchId,
      departmentId: execution.outputDepartmentId,
      details: outputDetails,
    },
    ...expenses.map((row): ITransaction => {
      const journal = journals.get(row.accountId);
      if (!journal)
        throw new Error(`Posting account not found: ${row.accountId}`);
      return {
        ...common,
        journal,
        side: 'ct',
        branchId: execution.outputBranchId,
        departmentId: execution.outputDepartmentId,
        description: row.name,
        details: [
          { _id: nanoid(), accountId: row.accountId, amount: row.amount },
        ],
      };
    }),
  ];
};

export const buildJobExecutionTransactions = (
  execution: IJobExecution & { _id: string },
  costs: Record<string, { unitCost: number }>,
  journals: ReadonlyMap<string, string>,
): ITransaction[] => {
  // Round cumulative material cost so merged invOut rows match journal repricing.
  const consumed = new Map<string, { count: number; amount: number }>();
  const inputAmount = (id: string, count: number, price: number) => {
    const previous = consumed.get(id) ?? { count: 0, amount: 0 };
    const totalCount = previous.count + count;
    const totalAmount = fixNum(totalCount * price, 4);
    consumed.set(id, { count: totalCount, amount: totalAmount });
    return fixNum(totalAmount - previous.amount, 4);
  };
  const docs = execution.jobs.flatMap((job) =>
    buildJobTransactions(
      { ...execution, ...job, _id: execution._id },
      costs,
      journals,
      inputAmount,
    ),
  );
  const inventory = new Map<string, ITransaction>();
  const detailGroups = new Map<
    string,
    Map<string, ITransaction['details'][number]>
  >();
  const credits: ITransaction[] = [];
  for (const doc of docs) {
    if (!['invOut', 'invIncome'].includes(doc.journal)) {
      credits.push(doc);
      continue;
    }
    const key = JSON.stringify([
      doc.journal,
      doc.side,
      doc.branchId,
      doc.departmentId,
    ]);
    const target = inventory.get(key) ?? { ...doc, details: [] };
    inventory.set(key, target);
    const details =
      detailGroups.get(key) ??
      new Map<string, ITransaction['details'][number]>();
    detailGroups.set(key, details);
    for (const detail of doc.details) {
      const detailKey = JSON.stringify([detail.accountId, detail.productId]);
      const row = details.get(detailKey);
      if (!row) {
        const added = { ...detail };
        details.set(detailKey, added);
        target.details.push(added);
        continue;
      }
      row.count = (row.count ?? 0) + (detail.count ?? 0);
      row.amount = fixNum(row.amount + detail.amount, 4);
      if (doc.journal === 'invIncome') row.unitPrice = row.amount / row.count;
      if (
        !Number.isFinite(row.count) ||
        !Number.isFinite(row.amount) ||
        !Number.isFinite(row.unitPrice)
      )
        throw new Error('Merged inventory quantities and costs must be finite');
    }
  }
  return [...inventory.values(), ...credits];
};

export const matchExecutionTransactionIds = (
  docs: ITransaction[],
  previous: (ITransaction & { _id: string })[],
): ITransaction[] => {
  const used = new Set<string>();
  return docs.map((doc) => {
    const inventory = ['invOut', 'invIncome'].includes(doc.journal);
    const old = previous.find(
      (row) =>
        !used.has(row._id) &&
        row.journal === doc.journal &&
        row.side === doc.side &&
        (inventory || row.details[0]?.accountId === doc.details[0]?.accountId),
    );
    if (!old) return doc;
    used.add(old._id);
    const details = matchProductionDetailIds(doc.details, old.details);
    return { ...doc, _id: old._id, details };
  });
};
