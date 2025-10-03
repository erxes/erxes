import { IconPlus } from '@tabler/icons-react';
import { Button, Sheet } from 'erxes-ui';
import { erxesMessengerSetupSheetOpenAtom } from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { EMSetup } from '@/integrations/erxes-messenger/components/EMSetup';
import { settedIntegrationDetailAtom } from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import { resetErxesMessengerSetupAtom } from '@/integrations/erxes-messenger/states/EMSetupResetState';

export const AddErxesMessengerSheet = () => {
  const [open, setOpen] = useAtom(erxesMessengerSetupSheetOpenAtom);
  const settedIntegrationDetail = useAtomValue(settedIntegrationDetailAtom);
  const resetErxesMessengerSetup = useSetAtom(resetErxesMessengerSetupAtom);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <div>
        <Sheet.Trigger asChild>
          <Button
            onClick={() =>
              settedIntegrationDetail && resetErxesMessengerSetup()
            }
          >
            <IconPlus />
            Add Messenger
          </Button>
        </Sheet.Trigger>
      </div>
      <EMSetup title="Add Erxes Messenger" />
    </Sheet>
  );
};
