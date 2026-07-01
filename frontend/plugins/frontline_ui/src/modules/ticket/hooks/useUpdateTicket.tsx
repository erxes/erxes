import { useMutation, MutationHookOptions } from '@apollo/client';
import { UPDATE_TICKET_MUTATION } from '@/ticket/graphql/mutations/updateTicket';
import { useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const useUpdateTicket = () => {
  const { t } = useTranslation('frontline');
  const { toast } = useToast();
  const [_updateTicket, { loading, error }] = useMutation(
    UPDATE_TICKET_MUTATION,
  );
  const updateTicket = (options: MutationHookOptions) => {
    return _updateTicket({
      ...options,
      onError: (error) => {
        options.onError?.(error);

        if (!options.onError) {
          toast({
            title: t('error'),
            description: error.message,
            variant: 'destructive',
          });
        }
      },
      onCompleted: (data) => {
        options.onCompleted?.(data);
      },
    });
  };

  return { updateTicket, loading, error };
};
