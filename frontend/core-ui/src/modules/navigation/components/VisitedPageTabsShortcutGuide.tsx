import { isMacPlatform } from '@/navigation/utils/visitedPageTabShortcuts';
import { IconKeyboard } from '@tabler/icons-react';
import { Button, HoverCard, Kbd } from 'erxes-ui';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

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
          className="size-8 shrink-0 text-muted-foreground"
          size="icon"
          type="button"
          variant="ghost"
        >
          <IconKeyboard className="size-4" />
        </Button>
      </HoverCard.Trigger>
      <HoverCard.Content align="end" className="w-80 p-0" side="bottom">
        <div className="border-b px-3 py-2 text-xs font-medium text-muted-foreground">
          {t('tab-shortcuts')}
        </div>
        <div className="py-1">
          {shortcuts.map(({ label, shortcutKey }) => (
            <div
              className="flex min-h-9 items-center justify-between gap-6 px-3 py-1.5"
              key={shortcutKey}
            >
              <span className="text-[13px] text-foreground">{label}</span>
              <span className="flex shrink-0 items-center gap-1">
                {[...modifierKeys, shortcutKey].map((key, index) => (
                  <Fragment key={`${shortcutKey}-${key}`}>
                    {index > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        +
                      </span>
                    )}
                    <Kbd
                      className="h-5 min-w-5 rounded border-border bg-muted px-1.5 font-mono text-[11px] font-medium text-foreground opacity-100 shadow-xs"
                      variant="foreground"
                    >
                      {key}
                    </Kbd>
                  </Fragment>
                ))}
              </span>
            </div>
          ))}
        </div>
      </HoverCard.Content>
    </HoverCard>
  );
};
