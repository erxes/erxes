import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { BUNDLE_CONDITION_ADD } from '../graphql/mutations/bundleConditions';
import { BUNDLE_CONDITIONS } from '../graphql/queries/getBundleConditions';

export const useBundleConditionAdd = () => {
  const [bundleConditionAdd, { loading }] = useMutation(BUNDLE_CONDITION_ADD);

  const handleAdd = (options?: MutationFunctionOptions) => {
    bundleConditionAdd({
      variables: {
        name: options?.variables?.name,
        description: options?.variables?.description,
        code: options?.variables?.code,
      },
      optimisticResponse: {
        bundleConditionAdd: {
          __typename: 'BundleCondition',
          _id: 'new' + Date.now(),
          name: options?.variables?.name,
          description: options?.variables?.description,
          code: options?.variables?.code,
          createdAt: new Date().toISOString(),
          userId: null,
        },
      },
      update: (cache, result) => {
        if (!result?.data?.bundleConditionAdd) {
          return;
        }
        const { bundleConditionAdd } = result.data;
        cache.updateQuery({ query: BUNDLE_CONDITIONS }, (data) => ({
          bundleConditions: [
            bundleConditionAdd,
            ...(data?.bundleConditions || []),
          ],
        }));
      },
      ...options,
    });
  };

  return { bundleConditionAdd: handleAdd, loading };
};
