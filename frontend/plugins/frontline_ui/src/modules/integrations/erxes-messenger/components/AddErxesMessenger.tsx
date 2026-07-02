import { IconPlus } from '@tabler/icons-react';
import { Button, Sheet } from 'erxes-ui';
import {
  erxesMessengerSetupSheetOpenAtom,
  settedIntegrationDetailAtom,
} from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { EMSetup } from '@/integrations/erxes-messenger/components/EMSetup';
import { resetErxesMessengerSetupAtom } from '@/integrations/erxes-messenger/states/EMSetupResetState';
import { useTranslation } from 'react-i18next';

export const AddErxesMessengerSheet = () => {
  const { t } = useTranslation('frontline');
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
            {t('add-messenger')}
          </Button>
        </Sheet.Trigger>
      </div>
      <EMSetup title={t('add-erxes-messenger')} />
    </Sheet>
  );
};
