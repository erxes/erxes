import { IconKeyboard } from '@tabler/icons-react';
import { Button, Kbd, Popover } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const NotificationShortcuts = () => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });
  const shortcuts = [
    { label: t('shortcut-navigate'), keys: 'J / K' },
    { label: t('shortcut-range'), keys: 'Shift + ↑ / ↓' },
    { label: t('shortcut-toggle'), keys: t('shortcut-toggle-keys') },
    { label: t('shortcut-action'), keys: 'Ctrl / ⌘ + ⌫' },
    { label: t('clear-selection'), keys: 'Esc' },
  ];

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('keyboard-shortcuts')}
          title={t('keyboard-shortcuts')}
        >
          <IconKeyboard />
        </Button>
      </Popover.Trigger>
      <Popover.Content
        align="end"
        className="w-80 max-w-[calc(100vw-2rem)] border p-4"
        aria-label={t('keyboard-shortcuts')}
      >
        <h3 className="mb-3 text-sm font-semibold">
          {t('keyboard-shortcuts')}
        </h3>
        <dl className="space-y-3">
          {shortcuts.map(({ label, keys }) => (
            <div
              key={label}
              className="flex items-center justify-between gap-3"
            >
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="shrink-0">
                <Kbd>{keys}</Kbd>
              </dd>
            </div>
          ))}
        </dl>
      </Popover.Content>
    </Popover>
  );
};
