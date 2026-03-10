import { useQueryState } from 'erxes-ui';

export const useBundleConditionsVariables = () => {
  const [searchValue] = useQueryState<string>('searchValue');

  return {
    searchValue: searchValue || undefined,
  };
};
