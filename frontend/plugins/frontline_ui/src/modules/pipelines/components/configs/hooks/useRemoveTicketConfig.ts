import { useMutation } from '@apollo/client';
import { REMOVE_TICKET_CONFIG } from '../graphql';
import { toast } from 'erxes-ui';

export const useRemoveTicketConfig = () => {
  const [removeTicketConfig, { loading }] = useMutation(REMOVE_TICKET_CONFIG, {
    refetchQueries: ['TicketConfig'],
    onCompleted: () => {
      toast({
        title: 'Success!',
        variant: 'success',
        description: 'Ticket config removed successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  return {
    removeTicketConfig,
    loading,
  };
};
