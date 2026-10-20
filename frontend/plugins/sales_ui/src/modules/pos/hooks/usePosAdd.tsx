import {
  MutationHookOptions,
  useApolloClient,
  useMutation,
} from '@apollo/client';
import { PosAddMutation, PosAddMutationVariables } from '~/gql/graphql';
import { mutations } from '../graphql';

export function usePosAdd(
  options?: MutationHookOptions<PosAddMutation, PosAddMutationVariables>,
) {
  const client = useApolloClient();
  const [posAdd, { loading, error }] = useMutation(mutations.posAdd, {
    ...options,
    // Report queries are mounted only while their screens are open.
    refetchQueries: () =>
      [...client.getObservableQueries('active').values()]
        .filter((query) =>
          [
            'salesPosSettingsList',
            'salesPosNavigationList',
            'salesPosOrdersPosList',
            'salesPosByItemsPosList',
            'salesPosCoversPosList',
            'salesPosItemsPosList',
            'salesPosSummaryPosList',
            'posList', // Still used by the Mongolian plugin's POS sync screens.
          ].includes(query.queryName ?? ''),
        )
        .map((query) => ({
          query: query.options.query,
          variables: query.variables,
        })),
  });

  return { posAdd, loading, error };
}
