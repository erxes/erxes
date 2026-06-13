'use client';

import { MutationHookOptions, useMutation } from '@apollo/client';

import { SPLIT_DEAL } from '@/deals/cards/components/detail/product/graphql/mutations/MergeSplitActions';
import { useToast } from 'erxes-ui';

export const useSplitDeal = (options?: MutationHookOptions) => {
  const { toast } = useToast();

  const [splitDeal, { loading, error }] = useMutation(SPLIT_DEAL, {
    ...options,
    onCompleted: (data) => {
      const count = data?.dealsSplit?.length || 0;
      toast({
        title: `Deal split into ${count} deal(s)`,
        variant: 'success',
      });
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

  return { splitDeal, loading, error };
};
