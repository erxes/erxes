import { useAtomValue, useSetAtom, useStore } from 'jotai';
import {
  erxesMessengerSetupEditSheetOpenAtom,
  settedIntegrationDetailAtom,
} from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import { EMSetup } from '@/integrations/erxes-messenger/components/EMSetup';
import { useEMIntegrationDetail } from '@/integrations/erxes-messenger/hooks/useEMIntegrationDetail';
import { useEffect } from 'react';
import { erxesMessengerSetSetupAtom } from '@/integrations/erxes-messenger/states/EMSetupSetAtom';
import { useMessengerDraft } from '../hooks/useMessengerDraft';

/** Restores the selected draft and accepts detail only for the active edit identity. */
export const EditErxesMessengerSheet = ({ id: idToEdit }: { id: string }) => {
  const ready = useMessengerDraft(idToEdit);
  const store = useStore();
  const populated = useAtomValue(settedIntegrationDetailAtom);
  const { integrationDetail, loading } = useEMIntegrationDetail({
    id: idToEdit,
  });
  const setEMSetupValues = useSetAtom(erxesMessengerSetSetupAtom);

  useEffect(() => {
    if (
      !populated &&
      integrationDetail?._id === idToEdit &&
      store.get(erxesMessengerSetupEditSheetOpenAtom) === idToEdit
    ) {
      setEMSetupValues(integrationDetail);
    }
  }, [idToEdit, integrationDetail, populated, setEMSetupValues, store]);

  return ready ? (
    <EMSetup loading={!populated && (loading || !integrationDetail)} />
  ) : null;
};
