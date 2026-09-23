import { useMutation } from '@apollo/client';
import { REMOVE_TICKET_CONFIG } from '../graphql';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useRemoveTicketConfig = () => {
  const { t } = useTranslation('frontline');
  const [removeTicketConfig, { loading }] = useMutation(REMOVE_TICKET_CONFIG, {
    refetchQueries: ['TicketConfig'],
    onCompleted: () => {
      toast({
        title: t('success', 'Success!'),
        variant: 'success',
        description: t(
          'ticket-config-removed-successfully',
          'Ticket config removed successfully',
        ),
      });
    },
    onError: (error) => {
      toast({
        title: t('error', 'Error'),
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
