import { z } from 'zod';
import { getJobFormSchema } from './jobFormSchema';
import type {
  AccountingJobFieldsFragment,
  AccountingJobOutputsQuery,
} from '~/gql/graphql';

export type IJob = AccountingJobFieldsFragment;
export type IJobItem = NonNullable<NonNullable<IJob['inputs']>[number]>;
export type IJobCost = IJob['laborCosts'][number];

export type TJobForm = z.infer<ReturnType<typeof getJobFormSchema>>;

export type IJobOutputRow = NonNullable<
  AccountingJobOutputsQuery['jobOutputs']
>['rows'][number];
