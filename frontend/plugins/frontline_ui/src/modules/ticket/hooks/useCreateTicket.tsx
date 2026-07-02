import { TICKETS_CURSOR_SESSION_KEY } from '@/ticket/constants';
import { CREATE_TICKET } from '@/ticket/graphql/mutations/createTicket';
import { useMutation } from '@apollo/client';
import { useRecordTableCursor, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useCreateTicket = () => {
  const { t } = useTranslation('frontline');
  const { toast } = useToast();
  const { setCursor } = useRecordTableCursor({
    sessionKey: TICKETS_CURSOR_SESSION_KEY,
  });
  const [createTicketMutation, { loading, error }] = useMutation(
    CREATE_TICKET,
    {
      onCompleted: () => {
        toast({
          title: t('success'),
          description: t('ticket-created-successfully'),
          variant: 'default',
        });
        setCursor(null);
      },
      onError: (e) => {
        toast({
          title: t('error'),
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
