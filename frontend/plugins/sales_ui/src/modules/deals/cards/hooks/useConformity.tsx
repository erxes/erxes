import { CONFORMITY_EDIT } from '@/deals/graphql/mutations/Conformity';
import { GET_DEAL_DETAIL } from '@/deals/graphql/queries/DealsQueries';
import { MutationHookOptions, useMutation } from '@apollo/client';
import { toast, useQueryState } from 'erxes-ui';

export function useConformityEdit(options?: MutationHookOptions<any, any>) {
  const [salesItemId] = useQueryState('salesItemId');

  const [editConformity, { loading, error }] = useMutation(CONFORMITY_EDIT, {
    ...options,
    variables: {
      ...options?.variables,
    },
    refetchQueries: [
      {
        query: GET_DEAL_DETAIL,
        variables: {
          ...options?.variables,
          _id: salesItemId,
        },
      },
    ],
    awaitRefetchQueries: true,
    onCompleted: (...args) => {
      toast({
        title: 'Successfully updated!',
        variant: 'default',
      });
      options?.onCompleted?.(...args);
    },
    onError: (err) => {
      toast({
        title: 'Error',
        description: err.message || 'Update failed',
        variant: 'destructive',
      });
    },
  });

  return {
    editConformity,
    loading,
    error,
  };
}
