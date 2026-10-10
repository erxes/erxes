import { useMutation } from '@apollo/client';
import { toast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { LOYALTY_SOURCE_AUTOMATION_SET_STATUS } from '../graphql/loyaltySourceAutomationStatusMutation';

// Turning a connection on or off is the automation's own status; core checks
// what it must before putting it live.
export const useLoyaltySourceAutomationStatus = () => {
  const { t } = useTranslation('loyalty');
  const [setStatus, { loading }] = useMutation(
    LOYALTY_SOURCE_AUTOMATION_SET_STATUS,
  );

  const toggle = (automationId: string, active: boolean) =>
    setStatus({
      variables: { _id: automationId, status: active ? 'active' : 'draft' },
      onCompleted: () =>
        toast({
          title: active
            ? t('loyalty-source-turned-on')
            : t('loyalty-source-turned-off'),
          variant: 'success',
        }),
      onError: (error) =>
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        }),
    });

  return { toggle, toggling: loading };
};
