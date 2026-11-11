import { useMutation } from '@apollo/client';
import { REMOVE_TICKET_CONFIG } from '../graphql';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { TICKET_CONFIG_CONTENT_TYPE } from '@/settings/constants/recordPanels';
import { useCloseRemovedSettingsRecord } from '@/settings/hooks/useCloseRemovedSettingsRecord';

export const useRemoveTicketConfig = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.pipelines' });
  const closeRemovedRecord = useCloseRemovedSettingsRecord(
    TICKET_CONFIG_CONTENT_TYPE,
  );
  const [removeTicketConfig, { loading }] = useMutation(REMOVE_TICKET_CONFIG, {
    refetchQueries: ['TicketConfig'],
    onCompleted: (data) => {
      closeRemovedRecord(data.ticketRemoveConfig?.id);
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
