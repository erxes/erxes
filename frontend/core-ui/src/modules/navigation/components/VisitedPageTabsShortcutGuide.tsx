import { IconQuestionMark } from '@tabler/icons-react';
import { Button, HoverCard, Kbd } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const ShortcutKeys = ({
  altKey,
  primaryKey,
  shortcutKey,
}: {
  altKey: string;
  primaryKey: string;
  shortcutKey: string;
}) => (
  <div className="flex items-center gap-1">
    <Kbd variant="foreground">{primaryKey}</Kbd>
    <span className="text-xs text-muted-foreground">+</span>
    <Kbd variant="foreground">{altKey}</Kbd>
    <span className="text-xs text-muted-foreground">+</span>
    <Kbd variant="foreground">{shortcutKey}</Kbd>
  </div>
);

export const VisitedPageTabsShortcutGuide = () => {
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });
  const isMac =
    typeof navigator !== 'undefined' &&
    /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const primaryKey = isMac ? '⌘' : 'Ctrl';
  const altKey = isMac ? '⌥' : 'Alt';
  const shortcuts = [
    { label: t('next-tab'), shortcutKey: ']' },
    { label: t('previous-tab'), shortcutKey: '[' },
    { label: t('close-all-tabs'), shortcutKey: 'X' },
  ];

  return (
    <HoverCard openDelay={150} closeDelay={100}>
      <HoverCard.Trigger asChild>
        <Button
          aria-label={t('tab-shortcuts')}
          className="size-7 shrink-0 rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
          size="icon"
          type="button"
          variant="ghost"
        >
          <IconQuestionMark className="size-4" />
        </Button>
      </HoverCard.Trigger>
      <HoverCard.Content align="end" className="w-72 p-3" side="bottom">
        <div className="mb-2 text-sm font-semibold">{t('tab-shortcuts')}</div>
        <div className="space-y-2">
          {shortcuts.map(({ label, shortcutKey }) => (
            <div
              className="flex items-center justify-between gap-4"
              key={shortcutKey}
            >
              <span className="text-xs text-muted-foreground">{label}</span>
              <ShortcutKeys
                altKey={altKey}
                primaryKey={primaryKey}
                shortcutKey={shortcutKey}
              />
            </div>
          ))}
        </div>
      </HoverCard.Content>
    </HoverCard>
  );
};
