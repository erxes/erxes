import { useMultiQueryState } from 'erxes-ui';

export type TechCardFilterParams = {
  searchValue?: string;
  laborCostName?: string;
  overheadCostName?: string;
  inputProductId?: string;
  outputProductId?: string;
  durationType?: string;
};

export const useTechCardFilters = (): TechCardFilterParams => {
  const [filters] = useMultiQueryState<TechCardFilterParams>([
    'searchValue',
    'laborCostName',
    'overheadCostName',
    'inputProductId',
    'outputProductId',
    'durationType',
  ]);
  return Object.fromEntries(
    Object.entries(filters).map(([key, value]) => [key, value || undefined]),
  );
};
