import {
  activeVisitedPageTabIdState,
  visitedPageTabsState,
  visitedPageTabsVisibleState,
} from '@/navigation/states/visitedPageTabsState';
import { isMacPlatform } from '@/navigation/utils/visitedPageTabShortcuts';
import { createVisitedPageTabId } from '@/navigation/utils/visitedPageTabs';
import { AppPath } from '@/types/paths/AppPath';
import { IconLayoutNavbarExpand, IconX } from '@tabler/icons-react';
import { Button, ContextMenu, Separator, Tooltip } from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const HOME_PAGE_PATH = `/${AppPath.MyInbox}`;

export const VisitedPageTabsOpenButton = () => {
  const tabs = useAtomValue(visitedPageTabsState);
  const tabsVisible = useAtomValue(visitedPageTabsVisibleState);
  const setActiveTabId = useSetAtom(activeVisitedPageTabIdState);
  const setTabs = useSetAtom(visitedPageTabsState);
  const setTabsVisible = useSetAtom(visitedPageTabsVisibleState);
  const navigate = useNavigate();
  const { t } = useTranslation('common', { keyPrefix: 'navigation' });

  const closeAllVisitedPageTabs = () => {
    const homeTabId = createVisitedPageTabId();

    setTabs([{ id: homeTabId, pathname: HOME_PAGE_PATH }]);
    setActiveTabId(homeTabId);
    navigate(HOME_PAGE_PATH, { replace: true });
  };

  if (tabsVisible) {
    return null;
  }

  const label = t('show-open-tabs', { count: tabs.length });
  const toggleTabsAriaShortcut = isMacPlatform()
    ? 'Meta+Alt+T'
    : 'Control+Alt+T';

  return (
    <div className="absolute top-0 left-[calc(var(--navigation-panel-toggle-space,0rem)+0.25rem)] z-30 flex h-13 items-center gap-1 pt-1">
      <ContextMenu>
        <Tooltip>
          <ContextMenu.Trigger asChild>
            <Tooltip.Trigger asChild>
              <Button
                aria-keyshortcuts={toggleTabsAriaShortcut}
                aria-label={label}
                className="h-8 min-w-8 shrink-0 gap-1 rounded-md px-1.5 text-xs font-semibold text-foreground tabular-nums hover:bg-accent-foreground/10"
                onClick={() => setTabsVisible(true)}
                type="button"
                variant="ghost"
              >
                <IconLayoutNavbarExpand className="size-4" />
                <span className="min-w-3 text-center">{tabs.length}</span>
              </Button>
            </Tooltip.Trigger>
          </ContextMenu.Trigger>
          <Tooltip.Content side="bottom">{label}</Tooltip.Content>
        </Tooltip>
        <ContextMenu.Content>
          <ContextMenu.Item onSelect={closeAllVisitedPageTabs}>
            <IconX />
            {t('close-all-tabs')}
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu>
      <Separator.Inline />
    </div>
  );
};
