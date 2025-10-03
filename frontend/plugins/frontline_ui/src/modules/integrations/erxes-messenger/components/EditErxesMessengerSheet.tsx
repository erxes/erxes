import { Sheet } from 'erxes-ui';
import { useAtom, useSetAtom } from 'jotai';
import { erxesMessengerSetupEditSheetOpenAtom } from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import { EMSetup } from '@/integrations/erxes-messenger/components/EMSetup';
import { useEMIntegrationDetail } from '@/integrations/erxes-messenger/hooks/useEMIntegrationDetail';
import { useEffect } from 'react';
import { erxesMessengerSetSetupAtom } from '@/integrations/erxes-messenger/states/EMSetupSetAtom';

export const EditErxesMessengerSheet = () => {
  const [idToEdit, setOpen] = useAtom(erxesMessengerSetupEditSheetOpenAtom);
  const { integrationDetail, loading } = useEMIntegrationDetail({
    id: idToEdit,
  });
  const setEMSetupValues = useSetAtom(erxesMessengerSetSetupAtom);

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
