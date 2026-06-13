'use client';

import {
  MutationHookOptions,
  useApolloClient,
  useMutation,
} from '@apollo/client';

import { MERGE_DEALS } from '@/deals/cards/components/detail/product/graphql/mutations/MergeSplitActions';
import { useToast } from 'erxes-ui';

/**
 * Wraps the MERGE_DEALS mutation with success/error toasts and refreshes the
 * board and deal-detail views once the merge completes.
 */
export const useMergeDeals = (options?: MutationHookOptions) => {
  const { toast } = useToast();
  const client = useApolloClient();

  const [mergeDeals, { loading, error }] = useMutation(MERGE_DEALS, {
    ...options,
    onCompleted: (data) => {
      toast({
        title: 'Deals merged',
        variant: 'success',
      });
      // The source deal is now `merged` (hidden from the board) and the target
      // gained the merged relations/labels — refresh both views so the change
      // is visible immediately.
      client.refetchQueries({ include: ['Deals', 'DealDetail'] });
      options?.onCompleted?.(data);
    },
    onError: (e) => {
      toast({
        title: 'Error',
        description: e.message,
        variant: 'destructive',
      });
      options?.onError?.(e);
    },
  });

  return { mergeDeals, loading, error };
};
