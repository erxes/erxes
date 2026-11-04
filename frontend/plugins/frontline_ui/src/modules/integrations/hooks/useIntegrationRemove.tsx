import { useMutation } from '@apollo/client';
import { toast, useConfirm } from 'erxes-ui';
import { useAtomValue, useSetAtom, useStore } from 'jotai';
import { currentUserState } from 'ui-modules';
import { clearIntegrationDrafts } from './useIntegrationDraft';
import { useTranslation } from 'react-i18next';
import { REMOVE_INTEGRATION } from '@/integrations/graphql/mutations/RemoveIntegration';
import {
  removedIntegrationIdsAtom,
  removingIntegrationIdsAtom,
} from '@/integrations/states/integrationRemoveStates';

/** Confirms removal, refreshes integration lists, and exits a deleted record. */
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
  const store = useStore();
  const user = useAtomValue(currentUserState);
  const setRemovingIds = useSetAtom(removingIntegrationIdsAtom);
  const [removeIntegration, { loading }] = useMutation(REMOVE_INTEGRATION, {
    refetchQueries: [
      'Integrations',
      'IntegrationsGetUsedTypes',
      'IntegrationsGetUsedTypesByChannel',
      'ChannelIntegrationsPeek',
      'frontlineChannelList',
    ],

    awaitRefetchQueries: true,
    onError(e) {
      toast({
        title: t('failed-to-remove-integration'),
        description: e?.message,
        variant: 'destructive',
      });
    },
  });

  /** Clears only this integration's pending marker when its removal settles. */
  const finishRemoval = () => {
    setRemovingIds((ids) => ids.filter((id) => id !== _id));
  };

  /** Confirms deletion and tracks the integration until removal settles. */
  const handleRemove = () => {
    confirm({
      message: t('confirm-remove-integration', { name }),
    }).then(() => {
      setRemovingIds((ids) => [...ids, _id]);

      removeIntegration({
        variables: { id: _id },
        onCompleted() {
          const prefix = `${JSON.stringify([user?._id, _id]).slice(0, -1)},`;
          clearIntegrationDrafts(store, (key) => key.startsWith(prefix));
          store.set(removedIntegrationIdsAtom, (ids) => new Set([...ids, _id]));
          toast({ title: t('integration-removed'), variant: 'default' });
        },
      }).finally(finishRemoval);
    });
  };

  return { handleRemove, loading };
};
