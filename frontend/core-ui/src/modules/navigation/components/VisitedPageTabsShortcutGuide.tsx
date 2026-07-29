import { isMacPlatform } from '@/navigation/utils/visitedPageTabShortcuts';
import { IconKeyboard } from '@tabler/icons-react';
import { Button, HoverCard, Kbd } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const VisitedPageTabsShortcutGuide = () => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const modifierKeys = isMacPlatform() ? ['⌘', '⌥'] : ['Ctrl', 'Alt'];
  const shortcuts = [
    { label: t('next-tab'), shortcutKey: ']' },
    { label: t('previous-tab'), shortcutKey: '[' },
    { label: t('close-current-tab'), shortcutKey: 'W' },
    { label: t('close-all-tabs'), shortcutKey: 'X' },
    { label: t('toggle-tabs-row'), shortcutKey: 'T' },
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
      <HoverCard.Content
        align="end"
        className="w-64 max-w-[calc(100vw-1rem)] p-0"
        side="bottom"
      >
        <div className="border-b px-2 py-2 text-xs font-medium text-muted-foreground">
          {t('tab-shortcuts')}
        </div>
        <div className="py-0.5">
          {shortcuts.map(({ label, shortcutKey }) => (
            <div
              className="flex min-h-7 items-center justify-between gap-2 px-2 py-0.5"
              key={shortcutKey}
            >
              <span className="text-[13px] text-foreground">{label}</span>
              <Kbd className="h-auto min-w-0 shrink-0 border-0 bg-transparent p-0 font-sans text-[13px] font-normal text-muted-foreground opacity-100">
                {[...modifierKeys, shortcutKey].join(' ')}
              </Kbd>
            </div>
          ))}
        </div>
      </HoverCard.Content>
    </HoverCard>
  );
};
