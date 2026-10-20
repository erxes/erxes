import { IconAdjustmentsHorizontal } from '@tabler/icons-react';
import { Button, DropdownMenu } from 'erxes-ui';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { inboxDisplayOptionsState } from '@/notification/states/notificationState';

export const NotificationDisplayOptions = () => {
  const [display, setDisplay] = useAtom(inboxDisplayOptionsState);
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const toggles = [
    { key: 'unreadFirst', label: t('unread-first', 'Show unread first') },
    { key: 'showPriority', label: t('show-priority', 'Show priority') },
    { key: 'showSender', label: t('show-sender', 'Show sender') },
  ] as const;
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('display-options', 'Display options')}
        >
          <IconAdjustmentsHorizontal />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end">
        {toggles.map(({ key, label }) => (
          <DropdownMenu.CheckboxItem
            key={key}
            checked={display[key]}
            onCheckedChange={(checked) =>
              setDisplay((prev) => ({ ...prev, [key]: checked }))
            }
          >
            {label}
          </DropdownMenu.CheckboxItem>
        ))}
        <DropdownMenu.Separator />
        <DropdownMenu.Label>{t('group-by', 'Group by')}</DropdownMenu.Label>
        <DropdownMenu.RadioGroup
          value={display.grouping}
          onValueChange={(value) => {
            if (value === 'none' || value === 'date' || value === 'plugin')
              setDisplay((prev) => ({ ...prev, grouping: value }));
          }}
        >
          <DropdownMenu.RadioItem value="none">
            {t('no-grouping', 'No grouping')}
          </DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem value="date">
            {t('date', 'Date')}
          </DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem value="plugin">
            {t('app', 'App')}
          </DropdownMenu.RadioItem>
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
