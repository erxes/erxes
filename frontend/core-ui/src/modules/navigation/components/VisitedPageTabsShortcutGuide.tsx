import { isMacPlatform } from '@/navigation/utils/visitedPageTabShortcuts';
import { IconKeyboard } from '@tabler/icons-react';
import { Button, HoverCard, Kbd } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const VisitedPageTabsShortcutGuide = () => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const { t: tSearch } = useTranslation('common', {
    keyPrefix: 'global-search',
  });
  const isMac = isMacPlatform();
  const modifierKeys = isMac ? ['⌘', '⌥'] : ['Ctrl', 'Alt'];
  const shortcuts = [
    {
      label: tSearch('placeholder', 'Search'),
      keys: [isMac ? '⌘' : 'Ctrl', 'K'],
    },
    { label: t('next-tab'), keys: [...modifierKeys, ']'] },
    { label: t('previous-tab'), keys: [...modifierKeys, '['] },
    { label: t('close-current-tab'), keys: [...modifierKeys, 'W'] },
    { label: t('close-all-tabs'), keys: [...modifierKeys, 'X'] },
    { label: t('toggle-tabs-row'), keys: [...modifierKeys, 'T'] },
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
          {shortcuts.map(({ label, keys }) => (
            <div
              className="flex min-h-7 items-center justify-between gap-2 px-2 py-0.5"
              key={label}
            >
              <span className="text-[13px] text-foreground">{label}</span>
              <Kbd className="h-auto min-w-0 shrink-0 border-0 bg-transparent p-0 font-sans text-[13px] font-normal text-muted-foreground opacity-100">
                {keys.join(' ')}
              </Kbd>
            </div>
          ))}
        </div>
      </HoverCard.Content>
    </HoverCard>
  );
};
