import { useMutation } from '@apollo/client';
import { BUNDLE_CONDITION_ADD } from '../graphql/mutations/bundleConditions';
import { BUNDLE_CONDITIONS } from '../graphql/queries/getBundleConditions';

export const useBundleConditionAdd = () => {
  const [bundleConditionAdd, { loading }] = useMutation(BUNDLE_CONDITION_ADD, {
    refetchQueries: [BUNDLE_CONDITIONS],
    awaitRefetchQueries: true,
  });

  return { bundleConditionAdd, loading };
};
