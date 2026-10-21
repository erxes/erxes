import type { AccountingJobExecutionFieldsFragment } from '~/gql/graphql';
import { IJob, TJobForm } from '@/settings/jobs/types/Job';

export type JobExecution = AccountingJobExecutionFieldsFragment;

export const jobValues = (card: IJob, quantity: number): TJobForm => ({
  name: card.name,
  description: card.description ?? '',
  durationType: 'real',
  duration: undefined,
  inputs: card.inputs.map((row) => ({
    productId: row.productId,
    uom: row.uom ?? '',
    quantity: row.quantity * quantity,
  })),
  outputs: card.outputs.map((row) => ({
    productId: row.productId,
    uom: row.uom ?? '',
    quantity: row.quantity * quantity,
    costRatio: row.costRatio ?? 1,
  })),
  laborCosts: (card.laborCosts ?? []).map((row) => ({
    name: row.name,
    amount: row.amount * quantity,
    accountId: row.accountId,
  })),
  overheadCosts: (card.overheadCosts ?? []).map((row) => ({
    name: row.name,
    amount: row.amount * quantity,
    accountId: row.accountId,
  })),
});
