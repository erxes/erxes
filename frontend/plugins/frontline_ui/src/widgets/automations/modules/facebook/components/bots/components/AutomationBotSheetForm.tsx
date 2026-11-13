import { IconPlus } from '@tabler/icons-react';
import { Button, useQueryState } from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AutomationBotPanel } from '~/widgets/automations/components/AutomationBotsPage';
import { AutomationBotForm } from '~/widgets/automations/modules/facebook/components/bots/components/AutomationBotForm';
import { isOpenFacebookBotSecondarySheet } from '~/widgets/automations/modules/facebook/components/bots/states/facebookBotStates';

export const AutomationBotSheetForm = () => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.facebook' });
  const [facebookBotId, setFacebookBotId] =
    useQueryState<string>('facebookBotId');
  const [isOpen, setOpen] = useState(false);
  const isOpenSecondary = useAtomValue(isOpenFacebookBotSecondarySheet);
  const setOpenSecondary = useSetAtom(isOpenFacebookBotSecondarySheet);
  useEffect(() => {
    if (facebookBotId) setOpen(true);
  }, [facebookBotId, setOpen]);
  const close = () => {
    setOpenSecondary(false);
    setFacebookBotId(null);
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
            key={facebookBotId || 'new'}
            facebookBotId={facebookBotId}
            onClose={close}
          />
        </AutomationBotPanel>
      )}
    </>
  );
};
