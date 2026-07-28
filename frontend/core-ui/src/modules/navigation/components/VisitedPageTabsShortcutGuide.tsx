import { isMacPlatform } from '@/navigation/utils/visitedPageTabShortcuts';
import { IconKeyboard } from '@tabler/icons-react';
import { Button, HoverCard, Kbd } from 'erxes-ui';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';

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
          className="size-8 shrink-0 text-muted-foreground"
          size="icon"
          type="button"
          variant="ghost"
        >
          <IconKeyboard className="size-4" />
        </Button>
      </HoverCard.Trigger>
      <HoverCard.Content align="end" className="w-72 p-1" side="bottom">
        <div className="px-2 py-1.5 text-xs font-medium text-accent-foreground">
          {t('tab-shortcuts')}
        </div>
        <div className="-mx-1 my-1 h-px bg-muted" />
        {shortcuts.map(({ label, shortcutKey }) => (
          <div
            className="grid h-9 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-sm px-2 text-sm font-medium"
            key={shortcutKey}
          >
            <span className="whitespace-nowrap">{label}</span>
            <Kbd className="h-6 gap-1.5 border-primary/25 bg-primary/10 px-2 font-mono text-foreground opacity-100 shadow-none">
              {[...modifierKeys, shortcutKey].map((key, index) => (
                <Fragment key={`${shortcutKey}-${key}`}>
                  {index > 0 && (
                    <span className="text-muted-foreground">+</span>
                  )}
                  <span
                    className={
                      index === modifierKeys.length ? 'text-primary' : undefined
                    }
                  >
                    {key}
                  </span>
                </Fragment>
              ))}
            </Kbd>
          </div>
        ))}
      </HoverCard.Content>
    </HoverCard>
  );
};
