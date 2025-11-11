import { useEffect } from 'react';
import { useQuery } from '@apollo/client';
import { GET_ACTIVITIES } from '@/activity/graphql/queries/getActivityLogs';
import { IActivity } from '@/ticket/types';
import { ICursorListResponse } from 'erxes-ui';

import { ACTIVITY_CHANGED } from '@/activity/graphql/subsciptions/activityChanged';

interface ISubscriptionData {
  ticketActivityChanged: {
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
  } = data?.getTicketActivities || {};

  useEffect(() => {
    const unsubscribe = subscribeToMore<ISubscriptionData>({
      document: ACTIVITY_CHANGED,
      variables: { contentId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!prev || !subscriptionData.data) return prev;

        const { type, activity } =
          subscriptionData.data.ticketActivityChanged;
        const currentList = prev.getTicketActivities.list;

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
          getTicketActivities: {
            ...prev.getTicketActivities,
            list: updatedList,
            pageInfo: prev.getTicketActivities.pageInfo,
            totalCount:
              type === 'created'
                ? prev.getTicketActivities.totalCount + 1
                : type === 'removed'
                ? prev.getTicketActivities.totalCount - 1
                : prev.getTicketActivities.totalCount,
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
