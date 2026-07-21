import { IconPlus } from '@tabler/icons-react';
import { Button, DropdownMenu, Label, useSetQueryStateByKey } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const BroadcastMethod = ({ onSelect }: { onSelect: () => void }) => {
  const { t } = useTranslation('broadcasts');
  const setQueryStateByKey = useSetQueryStateByKey();

  const handleSelect = (method: string) => {
    setQueryStateByKey('method', method);
    onSelect();
  };

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button>
          <IconPlus />
          {t('new-broadcast', 'New broadcast')}
        </Button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Content side="bottom" align="end" className="w-72 min-w-0">
        <DropdownMenu.RadioGroup onValueChange={handleSelect}>
          <DropdownMenu.RadioItem value="email" className="cursor-pointer">
            <div className="flex flex-col gap-1 p-2">
              <Label variant="peer">{t('email', 'Email')}</Label>
              <div className="text-xs text-accent-foreground">
                {t('method-option.email-description', 'Master email marketing with fully customized templates')}
              </div>
            </div>
          </DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem
            value="messenger"
            className="cursor-pointer"
            disabled
          >
            <div className="flex flex-col gap-1 p-2">
              <Label variant="peer">{t('messenger', 'Messenger')}</Label>
              <div className="text-xs text-accent-foreground">
                {t('method-option.messenger-description', 'Interact personally with direct in-app-messaging')}
              </div>
            </div>
          </DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem
            value="notification"
            className="cursor-pointer"
          >
            <div className="flex flex-col  gap-1 p-2">
              <Label variant="peer">{t('notification', 'Notification')}</Label>
              <div className="text-xs text-accent-foreground">
                {t('method-option.notification-description', 'Send automated notifications to your customers')}
              </div>
            </div>
          </DropdownMenu.RadioItem>
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
