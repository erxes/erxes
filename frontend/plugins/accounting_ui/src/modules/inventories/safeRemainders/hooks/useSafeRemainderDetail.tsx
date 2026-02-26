import { OperationVariables, useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { SAFE_REMAINDER_DETAIL_QUERY } from '../graphql/safeRemainderQueries';
import { ISafeRemainder } from '../types/SafeRemainder';
import { ACCOUNTING_SAFE_REMAINDER_CHANGED } from '../graphql/safeRemainderSubscription';

export const useSafeRemainderDetail = (options: OperationVariables) => {
  const { data, loading, error, subscribeToMore, client } = useQuery<
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

        try {
          // Get the cache ID for the conversation
          const newAdjustId = client.cache.identify({
            __typename: 'SafeRemainderDetail',
            _id: options.variables?._id,
          });

          if (newAdjustId) {
            // Update the conversation in the cache
            client.cache.modify({
              id: newAdjustId,
              fields: {
                newSafeRemainderDetail: () => newSafeRemainderDetail,
              },
            });
          }
        } catch (error) {
          console.error('Error updating cache:', error);
        }

        return {
          safeRemainderDetail: newSafeRemainderDetail,
        };
      },
    });
    return () => {
      unsubscribe();
    };
  }, []);

  return {
    safeRemainder,
    loading,
    error,
  };
};
