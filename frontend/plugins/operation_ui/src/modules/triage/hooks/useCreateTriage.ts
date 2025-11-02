import { useMutation } from '@apollo/client';

import { useToast } from 'erxes-ui';

import { CREATE_TRIAGE_MUTATION } from '@/triage/graphql/mutations/createTriage';
import { GET_TRIAGES } from '@/triage/graphql/queries/getTriages';

export const useCreateTriage = () => {
  const { toast } = useToast();

  const [createTriageMutation, { loading, error }] = useMutation(
    CREATE_TRIAGE_MUTATION,
    {
      refetchQueries: [GET_TRIAGES],
      onCompleted: (data) => {
        toast({
          title: 'Success',
          description: 'Triage created successfully',
          variant: 'default',
        });
      },
      onError: (e) => {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      },
    },
  );

  return {
    createTriage: createTriageMutation,
    loading,
    error,
  };
};
