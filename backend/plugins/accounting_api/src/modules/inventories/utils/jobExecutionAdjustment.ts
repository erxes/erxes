import { fixNum } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { buildJobExecutionTransactions } from './jobExecutionTransactions';

export const reallocateJobExecutionIncome = async (
  models: IModels,
  {
    adjustId,
    parentId,
    contentId,
  }: { adjustId: string; parentId: string; contentId: string },
): Promise<string[]> => {
  const execution = await models.JobExecutions.findOne({
    _id: contentId,
    parentId,
    status: 'posted',
  }).lean();
  if (!execution)
    throw new Error('Posted job execution not found for inventory adjustment');
  const transactions = await models.Transactions.find({
    parentId,
    contentType: 'jobExecution',
    contentId,
  }).lean();
  const sources = transactions.filter((row) => !row.originId);
  const outgoing = sources.filter((row) => row.journal === 'invOut');
  const incoming = sources.filter((row) => row.journal === 'invIncome');
  if (outgoing.length !== 1 || incoming.length !== 1)
    throw new Error('Job execution inventory transaction group is invalid');
  const expectedCounts = new Map<string, number>();
  for (const job of execution.jobs)
    for (const item of job.inputs) {
      expectedCounts.set(
        item.productId,
        (expectedCounts.get(item.productId) ?? 0) + item.quantity,
      );
    }
  const costs: Record<string, { unitCost: number }> = {};
  for (const detail of outgoing[0].details) {
    const id = detail.productId;
    const count = detail.count ?? 0;
    if (
      !id ||
      detail.accountId !== execution.inputAccountId ||
      count <= 0 ||
      !Number.isFinite(detail.amount) ||
      detail.amount < 0 ||
      fixNum(expectedCounts.get(id) ?? 0, 4) !== fixNum(count, 4)
    ) {
      throw new Error(
        'Job execution input transactions do not match saved actuals',
      );
    }
    costs[id] = { unitCost: detail.amount / count };
  }
  if (Object.keys(costs).length !== expectedCounts.size)
    throw new Error(
      'Job execution input transactions do not match saved actuals',
    );
  const journals = new Map(
    sources
      .filter((row) => row.side === 'ct' && row.journal !== 'invOut')
      .flatMap((row) =>
        row.details.map((detail) => [detail.accountId, row.journal] as const),
      ),
  );
  const generated = buildJobExecutionTransactions(
    execution,
    costs,
    journals,
  ).find((row) => row.journal === 'invIncome');
  if (!generated)
    throw new Error('Job execution income could not be recalculated');
  const income = incoming[0];
  const generatedDetails = new Map(
    generated.details.map((detail) => [
      JSON.stringify([detail.accountId, detail.productId]),
      detail,
    ]),
  );
  if (income.details.length !== generatedDetails.size)
    throw new Error(
      'Job execution output transactions do not match saved actuals',
    );
  const details = income.details.map((detail) => {
    const next = generatedDetails.get(
      JSON.stringify([detail.accountId, detail.productId]),
    );
    if (!next || fixNum(next.count ?? 0, 4) !== fixNum(detail.count ?? 0, 4))
      throw new Error(
        'Job execution output transactions do not match saved actuals',
      );
    return { ...detail, amount: next.amount, unitPrice: next.unitPrice };
  });
  const changes = details.flatMap((detail, index) => {
    const amount = fixNum(detail.amount - income.details[index].amount, 4);
    return amount ? [{ detail, amount }] : [];
  });
  if (
    !changes.length &&
    details.every(
      (detail, index) => detail.unitPrice === income.details[index].unitPrice,
    )
  )
    return [];
  await models.Transactions.updateOne(
    { _id: income._id },
    {
      $set: {
        details,
        sumDt: fixNum(
          details.reduce((sum, detail) => sum + detail.amount, 0),
          4,
        ),
        sumCt: 0,
      },
    },
  );
  await changes.reduce<Promise<void>>(
    (previous, { detail, amount }) =>
      previous.then(async () => {
        const branchId = detail.branchId || income.branchId;
        const departmentId = detail.departmentId || income.departmentId;
        if (!branchId || !departmentId || !detail.productId) return;
        await models.AdjustInvDetails.increaseAdjustInvDetail({
          adjustId,
          accountId: detail.accountId,
          productId: detail.productId,
          branchId,
          departmentId,
          count: 0,
          amount,
          multiplier: 1,
        });
      }),
    Promise.resolve(),
  );
  return [income._id];
};
