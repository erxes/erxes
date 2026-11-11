import { IconPlus } from '@tabler/icons-react';
import { Button, useQueryState } from 'erxes-ui';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AutomationBotPanel } from '~/widgets/automations/components/AutomationBotsPage';
import { AutomationBotForm } from '~/widgets/automations/modules/instagram/components/bots/components/AutomationBotForm';
import {
  isOpenInstagramBotSecondarySheet,
  isOpenInstagramBotSheet,
} from '~/widgets/automations/modules/instagram/components/bots/states/instagramBotStates';

export const AutomationBotSheetForm = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.instagram' });
  const [instagramBotId, setInstagramBotId] =
    useQueryState<string>('instagramBotId');
  const [isOpen, setOpen] = useAtom(isOpenInstagramBotSheet);
  const isOpenSecondary = useAtomValue(isOpenInstagramBotSecondarySheet);
  const setOpenSecondary = useSetAtom(isOpenInstagramBotSecondarySheet);
  useEffect(() => {
    if (instagramBotId) setOpen(true);
  }, [instagramBotId, setOpen]);
  const close = () => {
    setOpenSecondary(false);
    setInstagramBotId(null);
    setOpen(false);
  };
  return (
    <>
      <Button disabled={isOpen} onClick={() => setOpen(true)}>
        <IconPlus />
        {t('add-bot', 'Add Bot')}
      </Button>
      {isOpen && (
        <AutomationBotPanel hidden={isOpenSecondary} onClose={close}>
          <AutomationBotForm
            key={instagramBotId || 'new'}
            instagramBotId={instagramBotId}
            onClose={close}
          />
        </AutomationBotPanel>
      )}
    </>
  );
};
