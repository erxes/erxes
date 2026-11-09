import { useUpdateTicket } from '@/ticket/hooks/useUpdateTicket';
import { isTicketRemoved } from '@/ticket/states/removedTicketsState';
import type { IFieldMutation } from 'ui-modules';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useTicketCustomFieldEdit = (): IFieldMutation => {
  const { updateTicket, loading: updateTicketLoading } = useUpdateTicket();
  const { toast } = useToast();
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.ticket' });
  return {
    propertiesDataMode: 'patch',
    mutate: (variables, callbacks) => {
      if (isTicketRemoved(variables._id)) {
        callbacks?.onError?.();
        return Promise.resolve({ data: undefined });
      }

      return updateTicket({
        variables,
        ...callbacks,
        onError: (error) => {
          callbacks?.onError?.();
          toast({
            title: t('error', 'Error'),
            description: error.message,
            variant: 'destructive',
          });
        },
      });
    },
    loading: updateTicketLoading,
  };
};
