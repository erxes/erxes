import { useQuery, useSubscription } from '@apollo/client';
import { GET_ACTIVITIES } from '@/activity/graphql/queries/getActivityLogs';
import { ACTIVITY_CHANGED } from '@/activity/graphql/subsciptions/activityChanged';
import { compactList, toCursorPageInfo } from '@/operation/utils/cursorList';

export const useActivities = (contentId: string) => {
  const variables = { contentId, direction: 'backward' as const, limit: 30 };
  const { data, loading, error, refetch, fetchMore } = useQuery(
    GET_ACTIVITIES,
    {
      variables,
      notifyOnNetworkStatusChange: true,
    },
  );

  const result = data?.getOperationActivities;
  const activities = compactList(result?.list);

  useSubscription(ACTIVITY_CHANGED, {
    variables: { contentId },
    ignoreResults: true,
    onData: ({ client, data: subData }) => {
      const event = subData.data?.operationActivityChanged;
      const activity = event?.activity;
      if (!activity?._id) return;

      if (event?.type === 'removed') {
        const cacheId = client.cache.identify({
          __typename: 'OperationActivity',
          _id: activity._id,
        });
        if (cacheId) {
          client.cache.evict({ id: cacheId });
          client.cache.gc();
        }
        client.cache.updateQuery(
          { query: GET_ACTIVITIES, variables },
          (prev) => {
            const result = prev?.getOperationActivities;
            if (!result) return;
            return {
              ...prev,
              getOperationActivities: {
                ...result,
                totalCount: (result.totalCount ?? 0) - 1,
              },
            };
          },
        );
        return;
      }

      if (event?.type === 'created') {
        client.cache.updateQuery(
          { query: GET_ACTIVITIES, variables },
          (prev) => {
            const result = prev?.getOperationActivities;
            if (!result?.list) return;
            if (result.list.some((item) => item?._id === activity._id)) {
              return prev;
            }
            return {
              ...prev,
              getOperationActivities: {
                ...result,
                list: [...result.list, activity],
                totalCount: (result.totalCount ?? 0) + 1,
              },
            };
          },
        );
      }
    },
  });

  return {
    activities,
    loading,
    error,
    loadOlder: () =>
      fetchMore({
        variables: { ...variables, cursor: result?.pageInfo?.startCursor },
        updateQuery: (previous, { fetchMoreResult }) => {
          const older = fetchMoreResult?.getOperationActivities;
          const current = previous.getOperationActivities;
          if (!older || !current) return previous;
          const currentIds = new Set(
            compactList(current.list).map((item) => item._id),
          );
          return {
            ...previous,
            getOperationActivities: {
              ...current,
              list: [
                ...compactList(older.list).filter(
                  (item) => !currentIds.has(item._id),
                ),
                ...compactList(current.list),
              ],
              pageInfo:
                current.pageInfo && older.pageInfo
                  ? {
                      ...current.pageInfo,
                      startCursor: older.pageInfo.startCursor,
                      hasPreviousPage: older.pageInfo.hasPreviousPage,
                    }
                  : current.pageInfo,
            },
          };
        },
      }),
    refetch,
    pageInfo: toCursorPageInfo(result?.pageInfo),
    totalCount: result?.totalCount,
  };
};
