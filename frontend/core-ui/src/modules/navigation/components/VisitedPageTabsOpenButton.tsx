import {
  visitedPageTabsState,
  visitedPageTabsVisibleState,
} from '@/navigation/states/visitedPageTabsState';
import { isMacPlatform } from '@/navigation/utils/visitedPageTabShortcuts';
import { IconLayoutNavbarExpand } from '@tabler/icons-react';
import { Button, Separator, Tooltip } from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

export const VisitedPageTabsOpenButton = () => {
  const tabs = useAtomValue(visitedPageTabsState);
  const tabsVisible = useAtomValue(visitedPageTabsVisibleState);
  const setTabsVisible = useSetAtom(visitedPageTabsVisibleState);
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  if (tabsVisible) {
    return null;
  }

  const label = t('show-open-tabs', { count: tabs.length });
  const toggleTabsAriaShortcut = isMacPlatform()
    ? 'Meta+Alt+T'
    : 'Control+Alt+T';

  return (
    <div className="absolute top-0 left-[calc(var(--navigation-panel-toggle-space,0rem)+0.25rem)] z-30 flex h-13 items-center gap-1 pt-1">
      <Tooltip>
        <Tooltip.Trigger asChild>
          <Button
            aria-keyshortcuts={toggleTabsAriaShortcut}
            aria-label={label}
            className="h-8 min-w-8 shrink-0 gap-1 rounded-md border bg-sidebar px-1.5 text-xs font-semibold text-foreground shadow-sm tabular-nums hover:bg-accent"
            onClick={() => setTabsVisible(true)}
            type="button"
            variant="ghost"
          >
            <IconLayoutNavbarExpand className="size-4" />
            <span className="min-w-3 text-center">{tabs.length}</span>
          </Button>
        </Tooltip.Trigger>
        <Tooltip.Content side="bottom">{label}</Tooltip.Content>
      </Tooltip>
      <Separator.Inline />
    </div>
  );
};
