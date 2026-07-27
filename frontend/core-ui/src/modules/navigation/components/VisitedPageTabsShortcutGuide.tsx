import { isMacPlatform } from '@/navigation/utils/visitedPageTabShortcuts';
import { IconKeyboard } from '@tabler/icons-react';
import { Button, HoverCard } from 'erxes-ui';
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
    <HoverCard openDelay={150} closeDelay={100}>
      <HoverCard.Trigger asChild>
        <Button
          aria-label={t('tab-shortcuts')}
          className="size-8 shrink-0 text-muted-foreground"
          size="icon"
          type="button"
          variant="ghost"
        >
          <IconKeyboard className="size-4" />
        </Button>
      </HoverCard.Trigger>
      <HoverCard.Content align="end" className="w-64 p-1" side="bottom">
        <div className="px-2 py-1.5 text-xs font-medium text-accent-foreground">
          {t('tab-shortcuts')}
        </div>
        <div className="-mx-1 my-1 h-px bg-muted" />
        {shortcuts.map(({ label, shortcutKey }) => (
          <div
            className="flex h-8 items-center gap-6 rounded-sm px-2 text-sm font-medium"
            key={shortcutKey}
          >
            <span>{label}</span>
            <span className="ml-auto text-xs tracking-widest opacity-60">
              {modifierKeys}
              {shortcutKey}
            </span>
          </div>
        ))}
      </HoverCard.Content>
    </HoverCard>
  );
};
