import { MutationHookOptions, useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { UPDATE_SCORE_CAMPAIGN } from '../graphql/mutations/editLoyaltyScoreMutation';

export const useLoyaltyScoreEdit = () => {
  const { toast } = useToast();
  const [editStatus, { loading }] = useMutation(UPDATE_SCORE_CAMPAIGN);

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
