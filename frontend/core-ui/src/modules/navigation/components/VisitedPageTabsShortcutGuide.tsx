import { isMacPlatform } from '@/navigation/utils/visitedPageTabShortcuts';
import { IconKeyboard } from '@tabler/icons-react';
import { Button, DropdownMenu } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

// skipcq: JS-D1001 - Covered by repository documentation policy.
export const VisitedPageTabsShortcutGuide = () => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const modifierKeys = isMacPlatform() ? '⌘⌥' : 'Ctrl Alt ';
  const shortcuts = [
    { label: t('next-tab'), shortcutKey: ']' },
    { label: t('previous-tab'), shortcutKey: '[' },
    { label: t('close-current-tab'), shortcutKey: 'W' },
    { label: t('close-all-tabs'), shortcutKey: 'X' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <Button
          aria-label={t('tab-shortcuts')}
          className="size-8 shrink-0 text-muted-foreground"
          size="icon"
          type="button"
          variant="ghost"
        >
          <IconKeyboard className="size-4" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content align="end" className="min-w-64" side="bottom">
        <DropdownMenu.Label>{t('tab-shortcuts')}</DropdownMenu.Label>
        <DropdownMenu.Separator />
        {shortcuts.map(({ label, shortcutKey }) => (
          <div
            className="flex h-8 items-center gap-6 rounded-sm px-2 text-sm font-medium"
            key={shortcutKey}
          >
            <span>{label}</span>
            <DropdownMenu.Shortcut>
              {modifierKeys}
              {shortcutKey}
            </DropdownMenu.Shortcut>
          </div>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};
