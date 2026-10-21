import { useMultiQueryState } from 'erxes-ui';

export type JobFilterParams = {
  searchValue?: string;
  laborCostName?: string;
  overheadCostName?: string;
  inputProductId?: string;
  outputProductId?: string;
  durationType?: string;
  status?: string;
  hasLabor?: boolean;
  hasOverhead?: boolean;
  duplicatedOutput?: boolean;
};

type JobFilterQueryParams = Omit<
  JobFilterParams,
  'hasLabor' | 'hasOverhead' | 'duplicatedOutput'
> & {
  hasLabor?: string | boolean;
  hasOverhead?: string | boolean;
  duplicatedOutput?: string | boolean;
};

export const useJobFilters = (unwindOutputs = false): JobFilterParams => {
  const [filters] = useMultiQueryState<JobFilterQueryParams>([
    'searchValue',
    'laborCostName',
    'overheadCostName',
    'inputProductId',
    'outputProductId',
    'durationType',
    'status',
    'hasLabor',
    'hasOverhead',
    ...(unwindOutputs ? ['duplicatedOutput' as const] : []),
  ]);
  return {
    ...Object.fromEntries(
      Object.entries(filters).map(([key, value]) => [key, value || undefined]),
    ),
    hasLabor: parseJobBooleanFilter(filters.hasLabor),
    hasOverhead: parseJobBooleanFilter(filters.hasOverhead),
    duplicatedOutput: unwindOutputs
      ? parseJobBooleanFilter(filters.duplicatedOutput)
      : undefined,
  };
};

export const parseJobBooleanFilter = (
  value?: string | boolean | null,
): boolean | undefined => {
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return undefined;
};
