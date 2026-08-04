import { QueryHookOptions, useQuery } from '@apollo/client';
import { BUNDLE_RULES } from '../graphql/queries/getBundleRules';
import { IBundleRule } from '../components/productsConfig/bundleRule/types';

export const useBundleRules = (
  options?: QueryHookOptions<{ bundleRules: IBundleRule[] }>
) => {
  const { data, loading } = useQuery<{
    bundleRules: IBundleRule[];
  }>(BUNDLE_RULES, options);

  return { bundleRules: data?.bundleRules, loading };
};
