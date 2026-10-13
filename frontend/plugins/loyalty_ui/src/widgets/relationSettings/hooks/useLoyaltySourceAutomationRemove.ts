import { useMutation } from '@apollo/client';
import { toast, useConfirm } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { LOYALTY_SOURCE_AUTOMATION_REMOVE } from '../graphql/loyaltySourceAutomationRemoveMutation';

// Evicting the record drops it from every list showing it, other plugins' too.
export const useLoyaltySourceAutomationRemove = () => {
  const { t } = useTranslation('loyalty');
  const { confirm } = useConfirm();
  const [remove, { loading }] = useMutation(LOYALTY_SOURCE_AUTOMATION_REMOVE);

  const removeAutomation = (automationId: string, name: string) =>
    confirm({
      message: t('loyalty-source-remove-confirm', {
        defaultValue:
          'Disconnect "{{name}}"? The automation behind it is deleted.',
        name,
      }),
    }).then(() =>
      remove({
        variables: { automationIds: [automationId] },
        update: (cache) => {
          cache.evict({
            id: cache.identify({ __typename: 'Automation', _id: automationId }),
          });
          cache.gc();
        },
        onCompleted: () =>
          toast({ title: t('deleted', 'Deleted'), variant: 'success' }),
        onError: (error) =>
          toast({
            title: t('error', 'Error'),
            description: error.message,
            variant: 'destructive',
          }),
      }),
    );

  return { removeAutomation, removing: loading };
};
