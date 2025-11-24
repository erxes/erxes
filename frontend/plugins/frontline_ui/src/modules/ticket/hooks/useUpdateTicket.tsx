import { useMutation, MutationHookOptions } from '@apollo/client';
import { UPDATE_TICKET_MUTATION } from '@/ticket/graphql/mutations/updateTicket';
import { useToast } from 'erxes-ui';

export const useUpdateTicket = () => {
  const { toast } = useToast();
  const [_updateTicket, { loading, error }] = useMutation(
    UPDATE_TICKET_MUTATION,
  );
  const updateTicket = (options: MutationHookOptions) => {
    return _updateTicket({
      ...options,
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  return { updateTicket, loading, error };
};
