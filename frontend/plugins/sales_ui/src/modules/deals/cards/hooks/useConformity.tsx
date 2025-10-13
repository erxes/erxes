import { CONFORMITY_EDIT } from '@/deals/graphql/mutations/Conformity';
import { GET_DEAL_DETAIL } from '@/deals/graphql/queries/DealsQueries';
import { MutationHookOptions } from '@apollo/client';
import { dealDetailSheetState } from '@/deals/states/dealDetailSheetState';
import { toast } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useMutation } from '@apollo/client';

export function useConformityEdit(options?: MutationHookOptions<any, any>) {
  const [_id] = useAtom(dealDetailSheetState);

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
          _id,
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
