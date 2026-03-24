import { MutationFunctionOptions, useMutation } from '@apollo/client';
import { UOMS_ADD } from '../graphql/mutations/cudUoms';
import { UOMS } from '../graphql/queries/getUoms';

export const useUomsAdd = () => {
  const [uomsAdd, { loading }] = useMutation(UOMS_ADD);

  const handleUomsAdd = (options?: MutationFunctionOptions) => {
    uomsAdd({
      variables: {
        name: options?.variables?.name,
        code: options?.variables?.code,
        isForSubscription: options?.variables?.isForSubscription,
        subscriptionConfig: options?.variables?.subscriptionConfig,
        timely: options?.variables?.timely,
      },
      optimisticResponse: {
        uomsAdd: {
          __typename: 'Uom',
          _id: 'new' + Date.now(),
          name: options?.variables?.name,
          code: options?.variables?.code,
          createdAt: new Date().toISOString(),
          isForSubscription: options?.variables?.isForSubscription || false,
          subscriptionConfig: options?.variables?.subscriptionConfig || null,
          timely: options?.variables?.timely || null,
        },
      },
      update: (cache, { data: { uomsAdd } }) => {
        cache.updateQuery(
          {
            query: UOMS,
          },
          (data) => ({
            uoms: [uomsAdd, ...(data?.uoms || [])],
          }),
        );
      },
      ...options,
    });
  };

  return { uomsAdd: handleUomsAdd, loading };
};
