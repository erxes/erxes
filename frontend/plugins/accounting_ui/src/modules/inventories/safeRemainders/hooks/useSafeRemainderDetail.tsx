import { OperationVariables, useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { SAFE_REMAINDER_DETAIL_QUERY } from '../graphql/safeRemainderQueries';
import { ISafeRemainder } from '../types/SafeRemainder';
import { ACCOUNTING_SAFE_REMAINDER_CHANGED } from '../graphql/safeRemainderSubscription';

export const useSafeRemainderDetail = (options: OperationVariables) => {
  const { data, loading, error, subscribeToMore } = useQuery<
    { safeRemainderDetail: ISafeRemainder },
    OperationVariables
  >(SAFE_REMAINDER_DETAIL_QUERY, {
    ...options,
  });

  const safeRemainder = data?.safeRemainderDetail;

  useEffect(() => {
    const unsubscribe = subscribeToMore<{
      accountingSafeRemainderChanged: ISafeRemainder;
    }>({
      document: ACCOUNTING_SAFE_REMAINDER_CHANGED,
      variables: {
        adjustId: options.variables?._id,
      },
      updateQuery: (prev, { subscriptionData }) => {
        if (!prev || !subscriptionData.data) return prev;

        const newSafeRemainderDetail =
          subscriptionData.data.accountingSafeRemainderChanged;

        return {
          safeRemainderDetail: newSafeRemainderDetail,
        };
      },
    });
    return () => {
      unsubscribe();
    };
  }, [options.variables?._id, subscribeToMore]);

  return {
    safeRemainder,
    loading,
    error,
  };
};
