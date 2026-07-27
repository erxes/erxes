import { isMacPlatform } from '@/navigation/utils/visitedPageTabShortcuts';
import { IconKeyboard } from '@tabler/icons-react';
import { Button, HoverCard, Kbd } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

// skipcq: JS-D1001 - Covered by repository documentation policy.
const ShortcutKeys = ({
  modifierKeys,
  shortcutKey,
}: {
  modifierKeys: string[];
  shortcutKey: string;
}) => (
  <div className="flex shrink-0 items-center gap-1">
    {[...modifierKeys, shortcutKey].map((key) => (
      <Kbd
        className="min-w-6 justify-center border bg-background px-1.5 shadow-xs"
        key={key}
        variant="foreground"
      >
        {key}
      </Kbd>
    ))}
  </div>
);

// skipcq: JS-D1001 - Covered by repository documentation policy.
export const VisitedPageTabsShortcutGuide = () => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const modifierKeys = isMacPlatform() ? ['⌘', '⌥'] : ['Ctrl', 'Alt'];
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
          className="size-8 shrink-0 rounded-md border bg-background text-muted-foreground shadow-xs hover:bg-accent hover:text-foreground"
          size="icon"
          type="button"
          variant="ghost"
        >
          <IconKeyboard className="size-4" />
        </Button>
      </HoverCard.Trigger>
      <HoverCard.Content align="end" className="w-80 p-2" side="bottom">
        <div className="px-2 py-1.5 text-sm font-semibold">
          {t('tab-shortcuts')}
        </div>
        <div className="rounded-md border bg-muted/30 p-1">
          {shortcuts.map(({ label, shortcutKey }) => (
            <div
              className="flex min-h-9 items-center justify-between gap-4 rounded px-2 hover:bg-background"
              key={shortcutKey}
            >
              <span className="text-xs font-medium text-foreground">
                {label}
              </span>
              <ShortcutKeys
                modifierKeys={modifierKeys}
                shortcutKey={shortcutKey}
              />
            </div>
          ))}
        </div>
      </HoverCard.Content>
    </HoverCard>
  );
};
