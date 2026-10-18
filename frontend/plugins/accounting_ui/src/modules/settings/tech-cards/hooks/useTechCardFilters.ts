import { useMultiQueryState } from 'erxes-ui';

export type TechCardFilterParams = {
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

type TechCardFilterQueryParams = Omit<
  TechCardFilterParams,
  'hasLabor' | 'hasOverhead' | 'duplicatedOutput'
> & {
  hasLabor?: string | boolean;
  hasOverhead?: string | boolean;
  duplicatedOutput?: string | boolean;
};

export const useTechCardFilters = (
  unwindOutputs = false,
): TechCardFilterParams => {
  const [filters] = useMultiQueryState<TechCardFilterQueryParams>([
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
    hasLabor: parseTechCardBooleanFilter(filters.hasLabor),
    hasOverhead: parseTechCardBooleanFilter(filters.hasOverhead),
    duplicatedOutput: unwindOutputs
      ? parseTechCardBooleanFilter(filters.duplicatedOutput)
      : undefined,
  };
};

export const parseTechCardBooleanFilter = (
  value?: string | boolean | null,
): boolean | undefined => {
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return undefined;
};
