import { useMultiQueryState } from 'erxes-ui';

export const executionFilterKeys = [
  'searchValue',
  'status',
  'jobId',
  'jobName',
  'inputProductId',
  'outputProductId',
  'laborCostName',
  'overheadCostName',
  'inputAccountId',
  'inputBranchId',
  'inputDepartmentId',
  'outputAccountId',
  'outputBranchId',
  'outputDepartmentId',
] as const;
export type JobExecutionFilters = Partial<
  Record<(typeof executionFilterKeys)[number], string>
>;

export const useJobExecutionFilters = (): JobExecutionFilters => {
  const [filters] = useMultiQueryState<JobExecutionFilters>([
    ...executionFilterKeys,
  ]);
  return Object.fromEntries(
    Object.entries(filters).map(([key, value]) => [
      key,
      value?.trim() || undefined,
    ]),
  );
};
