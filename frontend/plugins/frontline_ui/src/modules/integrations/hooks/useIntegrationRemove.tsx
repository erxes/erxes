import { useMutation } from '@apollo/client';
import { toast, useConfirm } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { REMOVE_INTEGRATION } from '@/integrations/graphql/mutations/RemoveIntegration';
import { removingIntegrationIdsAtom } from '@/integrations/states/integrationRemoveStates';

export const useIntegrationRemove = ({
  _id,
  name,
}: {
  _id: string;
  name: string;
}) => {
  const { t } = useTranslation('frontline', {
    keyPrefix: 'modules.integrations',
  });
  const { confirm } = useConfirm();
  const setRemovingIds = useSetAtom(removingIntegrationIdsAtom);
  const [removeIntegration, { loading }] = useMutation(REMOVE_INTEGRATION, {
    refetchQueries: [
      'Integrations',
      'IntegrationsGetUsedTypes',
      'IntegrationsGetUsedTypesByChannel',
      'ChannelIntegrationsPeek',
      'frontlineChannelList',
    ],
    // The row stays locked until the list no longer has it.
    awaitRefetchQueries: true,
    onCompleted() {
      toast({
        title: t('integration-removed'),
        variant: 'default',
      });
    },
    onError(e) {
      toast({
        title: t('failed-to-remove-integration'),
        description: e?.message,
        variant: 'destructive',
      });
    },
  });

  const handleRemove = () => {
    confirm({
      message: t('confirm-remove-integration', { name }),
    }).then(() => {
      setRemovingIds((ids) => [...ids, _id]);

      removeIntegration({ variables: { id: _id } }).finally(() =>
        setRemovingIds((ids) => ids.filter((id) => id !== _id)),
      );
    });
  };

  return { handleRemove, loading };
};
