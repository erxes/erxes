import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ACTIVITIES } from '@/activity/graphql/queries/getActivityLogs';
import { IActivity } from '@/activity/types';
import { ICursorListResponse } from 'erxes-ui';
import { ACTIVITY_CHANGED } from '@/activity/graphql/subsciptions/activityChanged';

interface ISubscriptionData {
  operationActivityChanged: {
    type: 'created' | 'updated' | 'removed';
    activity: IActivity;
  };
}

export const useActivities = (contentId: string) => {
  const { data, loading, refetch, subscribeToMore } = useQuery<
    ICursorListResponse<IActivity>
  >(GET_ACTIVITIES, {
    variables: { contentId },
  });

  const {
    list: activities,
    pageInfo,
    totalCount,
  } = data?.getOperationActivities || {};

  useEffect(() => {
    const unsubscribe = subscribeToMore<ISubscriptionData>({
      document: ACTIVITY_CHANGED,
      variables: { contentId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!prev || !subscriptionData.data) return prev;

        const { type, activity } =
          subscriptionData.data.operationActivityChanged;
        const currentList = prev.getOperationActivities.list;

        let updatedList = currentList;

        if (type === 'created') {
          const exists = currentList.some(
            (item: IActivity) => item._id === activity._id,
          );
          if (!exists) {
            updatedList = [...currentList, activity];
          }
        }

        if (type === 'updated') {
          updatedList = currentList.map((item: IActivity) =>
            item._id === activity._id ? { ...item, ...activity } : item,
          );
        }

        if (type === 'removed') {
          updatedList = currentList.filter(
            (item: IActivity) => item._id !== activity._id,
          );
        }

        return {
          ...prev,
          getOperationActivities: {
            ...prev.getOperationActivities,
            list: updatedList,
            pageInfo: prev.getOperationActivities.pageInfo,
            totalCount:
              type === 'created'
                ? prev.getOperationActivities.totalCount + 1
                : type === 'removed'
                ? prev.getOperationActivities.totalCount - 1
                : prev.getOperationActivities.totalCount,
          },
        };
      },
    });

    return () => {
      unsubscribe();
    };
  }, [contentId, subscribeToMore]);

  return { activities, loading, refetch, pageInfo, totalCount };
};
