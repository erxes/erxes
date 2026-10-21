import type { AccountingJobFieldsFragment } from '~/gql/graphql';
import { IJob, IJobItem } from '../types/Job';

export const normalizeJob = (job: AccountingJobFieldsFragment): IJob => {
  const items = (rows: AccountingJobFieldsFragment['inputs']): IJobItem[] =>
    (rows ?? []).flatMap((row) =>
      row
        ? [
            {
              productId: row.productId ?? '',
              uom: row.uom ?? '',
              quantity: row.quantity ?? 0,
              costRatio: row.costRatio ?? undefined,
            },
          ]
        : [],
    );
  return {
    _id: job._id,
    code: job.code ?? undefined,
    name: job.name ?? '',
    description: job.description ?? undefined,
    duration: job.duration ?? undefined,
    durationType: job.durationType ?? undefined,
    status: job.status ?? undefined,
    inputs: items(job.inputs),
    outputs: items(job.outputs),
    laborCosts: job.laborCosts.map(({ name, amount, accountId }) => ({
      name,
      amount,
      accountId,
    })),
    overheadCosts: job.overheadCosts.map(({ name, amount, accountId }) => ({
      name,
      amount,
      accountId,
    })),
  };
};
