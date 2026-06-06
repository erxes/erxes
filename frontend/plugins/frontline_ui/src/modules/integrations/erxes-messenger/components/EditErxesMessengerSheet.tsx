import { Sheet } from 'erxes-ui';
import { useAtom, useSetAtom } from 'jotai';
import { erxesMessengerSetupEditSheetOpenAtom } from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import { EMSetup } from '@/integrations/erxes-messenger/components/EMSetup';
import { useEMIntegrationDetail } from '@/integrations/erxes-messenger/hooks/useEMIntegrationDetail';
import { useEffect, useRef, useState } from 'react';
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

  // True only after setEMSetupValues has been called for the current idToEdit.
  // Used to keep the spinner visible until atoms are populated, so EMAppearance
  // (and other step forms) never mount while atomValue is null — which would
  // cause persistValueTaken to initialise as true and block form reset.
  const [isPopulated, setIsPopulated] = useState(false);

  // When a different integration is opened for editing, clear the cached atom
  // state and mark atoms as not-yet-populated so the form stays hidden until
  // the API response arrives and the atoms are refilled.
  useEffect(() => {
    if (idToEdit && idToEdit !== prevIdRef.current) {
      prevIdRef.current = idToEdit;
      resetSetup(true);
      setIsPopulated(false);
    }
    if (!idToEdit) {
      prevIdRef.current = false;
    }
  }, [idToEdit, resetSetup]);

  // Once the API responds, populate all atoms with the fresh integration data,
  // then mark atoms as ready so the form is allowed to render.
  useEffect(() => {
    if (integrationDetail) {
      setEMSetupValues(integrationDetail);
      setIsPopulated(true);
    }
  }, [integrationDetail, setEMSetupValues]);

  return (
    <Sheet open={!!idToEdit} onOpenChange={() => setOpen(false)}>
      <EMSetup title="Edit Erxes Messenger" loading={loading || !isPopulated} />
    </Sheet>
  );
};
