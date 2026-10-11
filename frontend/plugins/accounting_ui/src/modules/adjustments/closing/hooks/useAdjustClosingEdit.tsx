import type { GraphqlMutationOptions } from '@/utils/graphqlMutation';
import { useMutation } from '@apollo/client';
import { toast, useQueryState } from 'erxes-ui';
import { ADJUST_CLOSING_EDIT } from '../graphql/adjustClosingEdit';

export const useAdjustClosingEdit = () => {
  const [adjustClosingId] = useQueryState<string>('adjustClosingId');
  const [mutate, { loading }] = useMutation(ADJUST_CLOSING_EDIT);

  const adjustClosingEdit = (
    options: GraphqlMutationOptions<typeof ADJUST_CLOSING_EDIT>,
  ) => {
    if (!adjustClosingId && !options.variables?._id)
      throw new Error('Closing id is required');
    return mutate({
      ...options,
      variables: {
        _id: adjustClosingId ?? '',
        ...options.variables,
      },
      update: (cache, { data }) => {
        const updatedData = data?.adjustClosingEdit;
        if (!updatedData) return;
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
        options.onError?.(error);
      },
    });
  };

  return { adjustClosingEdit, loading };
};

export const useAdjustClosingEntryEdit = useAdjustClosingEdit;
