import { QueryHookOptions, useQuery } from '@apollo/client';
import { BUNDLE_CONDITIONS } from '../graphql/queries/getBundleConditions';
import { IBundleCondition } from '../components/productsConfig/bundleCondition/types';

export const useBundleConditions = (
  variables?: { searchValue?: string },
  options?: QueryHookOptions<{ bundleConditions: IBundleCondition[] }>,
) => {
  const { data, loading } = useQuery<{
    bundleConditions: IBundleCondition[];
  }>(BUNDLE_CONDITIONS, {
    variables,
    ...options,
  });

  return { bundleConditions: data?.bundleConditions, loading };
};
