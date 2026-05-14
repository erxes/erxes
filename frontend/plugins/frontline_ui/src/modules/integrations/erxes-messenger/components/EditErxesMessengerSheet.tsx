import { Sheet } from 'erxes-ui';
import { useAtom, useSetAtom } from 'jotai';
import { erxesMessengerSetupEditSheetOpenAtom } from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import { EMSetup } from '@/integrations/erxes-messenger/components/EMSetup';
import { useEMIntegrationDetail } from '@/integrations/erxes-messenger/hooks/useEMIntegrationDetail';
import { useEffect, useRef } from 'react';
import { erxesMessengerSetSetupAtom } from '@/integrations/erxes-messenger/states/EMSetupSetAtom';
import { resetErxesMessengerSetupAtom } from '@/integrations/erxes-messenger/states/EMSetupResetState';

export const EditErxesMessengerSheet = () => {
  const [idToEdit, setOpen] = useAtom(erxesMessengerSetupEditSheetOpenAtom);
  const { integrationDetail, loading } = useEMIntegrationDetail({
    id: idToEdit,
  });
  const setEMSetupValues = useSetAtom(erxesMessengerSetSetupAtom);
  const resetSetup = useSetAtom(resetErxesMessengerSetupAtom);

  // Track the previous id so we can detect when the target integration changes.
  const prevIdRef = useRef<string | false>(false);

  // When a different integration is opened for editing, clear the cached atom
  // state immediately so the form never shows stale data from localStorage
  // while the API query is in-flight.
  useEffect(() => {
    if (idToEdit && idToEdit !== prevIdRef.current) {
      prevIdRef.current = idToEdit;
      // Pass `true` so the sheet stays open while we reset the data atoms.
      resetSetup(true);
    }
    if (!idToEdit) {
      prevIdRef.current = false;
    }
  }, [idToEdit, resetSetup]);

  // Once the API responds, populate all atoms with the fresh integration data.
  useEffect(() => {
    if (integrationDetail) {
      setEMSetupValues(integrationDetail);
    }
  }, [integrationDetail, setEMSetupValues]);

  return (
    <Sheet open={!!idToEdit} onOpenChange={() => setOpen(false)}>
      <EMSetup title="Edit Erxes Messenger" loading={loading} />
    </Sheet>
  );
};
