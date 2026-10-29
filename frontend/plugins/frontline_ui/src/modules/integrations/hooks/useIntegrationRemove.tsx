import { useMutation } from '@apollo/client';
import { toast, useConfirm } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { REMOVE_INTEGRATION } from '@/integrations/graphql/mutations/RemoveIntegration';
import { removingIntegrationIdsAtom } from '@/integrations/states/integrationRemoveStates';
import { useSidePanel } from 'ui-modules';
import { INTEGRATION_CONTENT_TYPE } from '@/integrations/components/IntegrationPanelForm';
import { useRef } from 'react';

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
  const panel = useSidePanel();
  const panelRef = useRef(panel);
  panelRef.current = panel;
  const [removeIntegration, { loading }] = useMutation(REMOVE_INTEGRATION, {
    update(cache) {
      cache.evict({ id: cache.identify({ __typename: 'Integration', _id }) });
      cache.gc();
      const { record, canGoBack, back, close } = panelRef.current;
      if (
        record?.contentType === INTEGRATION_CONTENT_TYPE &&
        record.contentId === _id
      ) {
        if (canGoBack) back();
        else close();
      }
    },
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
  });

  const handleRemove = async (): Promise<void> => {
    try {
      await confirm({ message: t('confirm-remove-integration', { name }) });
    } catch {
      return;
    }
    setRemovingIds((ids) => [...ids, _id]);
    try {
      await removeIntegration({ variables: { id: _id } });
    } catch (error: unknown) {
      toast({
        title: t('failed-to-remove-integration'),
        description: error instanceof Error ? error.message : undefined,
        variant: 'destructive',
      });
    } finally {
      setRemovingIds((ids) => ids.filter((id) => id !== _id));
    }
  };

  return { handleRemove, loading };
};
