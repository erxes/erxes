import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CALL_PRO_CUSTOMER_SELECT } from '@/integrations/callpro/graphql/mutations/callProMutations';

export const useCallProCustomerSelect = () => {
  const { t } = useTranslation('frontline');

  const [callProCustomerSelect, { loading }] = useMutation(
    CALL_PRO_CUSTOMER_SELECT,
    {
      refetchQueries: ['ConversationDetail'],
      onCompleted() {
        toast({ title: t('callpro-customer-selected') });
      },
      onError(e) {
        toast({
          title: t('callpro-customer-select-failed'),
          description: e.message,
          variant: 'destructive',
        });
      },
    },
  );

  return { callProCustomerSelect, loading };
};
