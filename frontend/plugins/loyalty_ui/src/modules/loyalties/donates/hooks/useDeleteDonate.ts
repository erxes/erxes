import { useMutation } from '@apollo/client';
import { useToast } from 'erxes-ui';
import { DELETE_DONATE_MUTATION } from '../graphql/mutations/mutations';

export const useDeleteDonate = () => {
  const { toast } = useToast();

  const [deleteDonate, { loading, error }] = useMutation(
    DELETE_DONATE_MUTATION,
    {
      refetchQueries: ['DonatesMain'],
    },
  );

  const handleDeleteDonate = async (variables: { _ids: string[] }) => {
    return deleteDonate({
      variables,
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Donation(s) deleted successfully',
          variant: 'default',
        });
      },
      onError: (err) => {
        toast({
          title: 'Error',
          description: err.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { deleteDonate: handleDeleteDonate, loading, error };
};
