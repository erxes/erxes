import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { BUNDLE_RULES_ADD } from '../graphql/mutations/bundleRules';
import { BUNDLE_RULES } from '../graphql/queries/getBundleRules';

export const useBundleRulesAdd = () => {
  const [bundleRulesAdd, { loading }] = useMutation(BUNDLE_RULES_ADD);

  const handleAdd = (options?: MutationFunctionOptions) => {
    bundleRulesAdd({
      variables: {
        name: options?.variables?.name,
        description: options?.variables?.description,
        code: options?.variables?.code,
        rules: options?.variables?.rules,
      },
      optimisticResponse: {
        bundleRulesAdd: {
          __typename: 'BundleRule',
          _id: 'new' + Date.now(),
          name: options?.variables?.name,
          description: options?.variables?.description,
          code: options?.variables?.code,
          rules: options?.variables?.rules || [],
          createdAt: new Date().toISOString(),
          userId: null,
        },
      },
      update: (cache, { data: { bundleRulesAdd } }) => {
        cache.updateQuery({ query: BUNDLE_RULES }, (data) => ({
          bundleRules: [bundleRulesAdd, ...(data?.bundleRules || [])],
        }));
      },
      ...options,
    });
  };

  return { bundleRulesAdd: handleAdd, loading };
};
