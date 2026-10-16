import { QueryHookOptions, useQuery } from '@apollo/client';
import { isDefined } from 'erxes-ui';
import { CALL_QUEUE_LIST } from '../graphql/queries/callQueueList';
import type {
  CallQueueListQuery,
  CallQueueListQueryVariables,
} from '~/gql/graphql';

export type ICallQueueListItem = NonNullable<
  NonNullable<CallQueueListQuery['callQueueList']>[number]
>;

export const useCallQueueList = (
  options: QueryHookOptions<CallQueueListQuery, CallQueueListQueryVariables>,
) => {
  const { data, loading, error, subscribeToMore } = useQuery(CALL_QUEUE_LIST, {
    ...options,
    skip: !options.variables?.inboxId,
  });

  const callQueueList = data?.callQueueList?.filter(isDefined);

  return {
    callQueueList,
    loading,
    error,
    subscribeToMore,
  };
};
