import { useSubscription } from '@apollo/client';
import { TASK_LIST_CHANGED } from '@/task/graphql/subscriptions/taskListChanged';
import { useDebouncedCallback } from 'use-debounce';
import type { ITaskFilter } from '~/gql/graphql';

// Progress widgets recompute from the server when their tasks change. A burst
// of task events (imports, bulk edits) refetches once instead of per event.
export const useRefetchOnTaskListChange = ({
  filter,
  skip,
  refetch,
}: {
  filter: ITaskFilter;
  skip?: boolean;
  refetch: () => unknown;
}) => {
  const refetchDebounced = useDebouncedCallback(() => {
    void refetch();
  }, 1000);

  useSubscription(TASK_LIST_CHANGED, {
    variables: { filter },
    skip,
    ignoreResults: true,
    onData: () => refetchDebounced(),
  });
};
