import { OperationVariables, useQuery } from '@apollo/client';
import { ACTIVITY_LOGS } from '../graphql/queries/activityQueries';
import { ACTIVITY_LOGS_CHANGED } from '../graphql/subscriptions/activitySubscriptions';
import { useEffect } from 'react';

export const useActivities = (operation?: OperationVariables) => {
  const { data, loading, error, subscribeToMore } = useQuery(
    ACTIVITY_LOGS,
    operation,
  );

  useEffect(() => {
    subscribeToMore({
      document: ACTIVITY_LOGS_CHANGED,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;
        return {
          activityLogs: [
            subscriptionData.data.activityLogsChanged,
            ...prev.activityLogs,
          ],
        };
      },
    });
  }, []);

  return {
    activityLogs: data?.activityLogs,
    loading,
    error,
  };
};
