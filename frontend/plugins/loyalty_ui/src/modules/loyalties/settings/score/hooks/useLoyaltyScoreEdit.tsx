import { MutationHookOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { editLoyaltyScoreMutation } from '../graphql/mutations/editLoyaltyScoreMutation';

export const useLoyaltyScoreEdit = () => {
  const { toast } = useToast();
  const [editStatus, { loading }] = useMutation(editLoyaltyScoreMutation);

  const mutate = ({ variables, ...options }: MutationHookOptions) => {
    editStatus({
      ...options,
      variables,
      onCompleted: () => toast({ title: 'Updated', variant: 'success' }),
      onError(error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
      refetchQueries: ['score'],
    });
  };
  return { editStatus: mutate, loading };
};
