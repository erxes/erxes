import { useAtomValue, useStore } from 'jotai';
import {
  erxesMessengerSetupEditSheetOpenAtom,
  settedIntegrationDetailAtom,
} from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import { EMSetup } from '@/integrations/erxes-messenger/components/EMSetup';
import { useEMIntegrationDetail } from '@/integrations/erxes-messenger/hooks/useEMIntegrationDetail';
import { useContext, useEffect } from 'react';
import { IntegrationDraftContext } from '@/integrations/hooks/useIntegrationDraft';

import {
  useMessengerDraft,
  refreshMessengerDraft,
  useMessengerSaving,
} from '../hooks/useMessengerDraft';

export const EditErxesMessengerSheet = ({ id: idToEdit }: { id: string }) => {
  const ready = useMessengerDraft(idToEdit);
  const [saving] = useMessengerSaving();
  const store = useStore();
  const populated = useAtomValue(settedIntegrationDetailAtom);
  const { integrationDetail, loading } = useEMIntegrationDetail({
    id: idToEdit,
  });
  const key = useContext(IntegrationDraftContext);

  useEffect(() => {
    if (
      ready &&
      !saving &&
      integrationDetail?._id === idToEdit &&
      store.get(erxesMessengerSetupEditSheetOpenAtom) === idToEdit
    ) {
      refreshMessengerDraft(store, key, integrationDetail);
    }
  }, [idToEdit, integrationDetail, ready, saving, key, store]);

  return ready ? (
    <EMSetup loading={!populated && (loading || !integrationDetail)} />
  ) : null;
};
