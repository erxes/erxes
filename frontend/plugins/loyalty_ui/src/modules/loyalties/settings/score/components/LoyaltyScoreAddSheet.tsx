import { IconPlus } from '@tabler/icons-react';

import {
  Button,
  Kbd,
  Sheet,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
} from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AddLoyaltyScoreForm } from '../add-score-campaign/components/AddLoyaltyScore';
import { LoyaltyHotKeyScope } from '../types/LoyaltyHotKeyScope';

export const LoyaltyScoreAddSheet = () => {
  const { t } = useTranslation('loyalty');
  const setHotkeyScope = useSetHotkeyScope();
  const [open, setOpen] = useState<boolean>(false);
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();

  const onOpen = () => {
    setOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(LoyaltyHotKeyScope.LoyaltyAddSheet);
  };

  const onClose = () => {
    setHotkeyScope(LoyaltyHotKeyScope.LoyaltiesPage);
    setOpen(false);
  };

  useScopedHotkeys(`c`, () => onOpen(), LoyaltyHotKeyScope.LoyaltiesPage);
  useScopedHotkeys(`esc`, () => onClose(), LoyaltyHotKeyScope.LoyaltyAddSheet);

  return (
    <Sheet
      onOpenChange={(open) => (open ? onOpen() : onClose())}
      open={open}
      modal
    >
      <Sheet.Trigger asChild>
        <Button>
          <IconPlus />
          {t('add-score-campaign')}
          <Kbd>C</Kbd>
        </Button>
      </Sheet.Trigger>
      <Sheet.View
        className="p-0 md:max-w-7xl md:w-[calc(100vw-(--spacing(4)))] flex flex-col gap-0 overflow-hidden"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <LoyaltyScoreAddSheetHeader />
        <AddLoyaltyScoreForm onOpenChange={setOpen} />
      </Sheet.View>
    </Sheet>
  );
};

export const LoyaltyScoreAddSheetHeader = () => {
  const { t } = useTranslation('loyalty');
  return (
    <Sheet.Header className="border-b gap-3">
      <Sheet.Title>{t('create-loyalty-score')}</Sheet.Title> <Sheet.Close />
    </Sheet.Header>
  );
};
