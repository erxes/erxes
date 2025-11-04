import { useMutation } from '@apollo/client';
import { CREATE_TICKET } from '@/ticket/graphql/mutations/createTicket';
import { useToast } from 'erxes-ui';
import { useRecordTableCursor } from 'erxes-ui';
import { TICKETS_CURSOR_SESSION_KEY } from '@/ticket/constants';

export const useCreateTicket = () => {
  const { toast } = useToast();
  const { setCursor } = useRecordTableCursor({
    sessionKey: TICKETS_CURSOR_SESSION_KEY,
  });
  const [createTicketMutation, { loading, error }] = useMutation(
    CREATE_TICKET,
    {
      onCompleted: () => {
        toast({
          title: 'Success',
          description: 'Ticket created successfully',
          variant: 'default',
        });
        setCursor(null);
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
    createTicket: createTicketMutation,
    loading,
    error,
  };
};
