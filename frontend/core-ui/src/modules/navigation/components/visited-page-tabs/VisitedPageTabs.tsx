import { SortableVisitedPageTab } from '@/navigation/components/visited-page-tabs/SortableVisitedPageTab';
import { VisitedPageTabsContent } from '@/navigation/components/visited-page-tabs/VisitedPageTabsContent';
import { VisitedPageTabsNewButton } from '@/navigation/components/visited-page-tabs/VisitedPageTabsNewButton';
import { AppLogo } from '@/navigation/components/AppLogo';
import { VisitedPageTabsShortcutGuide } from '@/navigation/components/visited-page-tabs/VisitedPageTabsShortcutGuide';
import { useNavigationActivities } from '@/navigation/hooks/useNavigationActivities';
import { usePluginsModules } from '@/navigation/hooks/usePluginsModules';
import { useVisitedPageTabs } from '@/navigation/hooks/useVisitedPageTabs';
import { useVisitedPageTabsKeyboardShortcuts } from '@/navigation/hooks/useVisitedPageTabsKeyboardShortcuts';
import { visitedPageTabsVisibleState } from '@/navigation/states/visitedPageTabsState';
import { findNavigationActivityByPath } from '@/navigation/utils/navigationActivities';
import { getVisitedPageTabLabel } from '@/navigation/utils/visitedPageTabs';
import { isMacPlatform } from '@/navigation/utils/visitedPageTabShortcuts';
import {
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { IconFile } from '@tabler/icons-react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

export const VisitedPageTabs = () => {
  const { i18n, t } = useTranslation('common');
  const [tabsVisible, setTabsVisible] = useAtom(visitedPageTabsVisibleState);
  const activities = useNavigationActivities();
  const modules = usePluginsModules() ?? [];
  const {
    activeTabId,
    closeAllVisitedPageTabs,
    closeOtherVisitedPageTabs,
    closeVisitedPageTab,
    closeVisitedPageTabsToRight,
    openNewVisitedPageTab,
    openVisitedPageTab,
    reorderVisitedPageTab,
    tabs,
  } = useVisitedPageTabs();
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const labels = {
    details: t('navigation.details'),
    myInbox: t('my-inbox'),
  };
  const isMac = isMacPlatform();
  const closeAriaShortcut = isMac ? 'Meta+Alt+W' : 'Control+Alt+W';
  const closeShortcutLabel = isMac ? '⌘ ⌥ W' : 'Ctrl Alt W';

  useVisitedPageTabsKeyboardShortcuts({
    activeTabId,
    closeAllTabs: closeAllVisitedPageTabs,
    closeTab: closeVisitedPageTab,
    openTab: openVisitedPageTab,
    tabs,
  });

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    if (
      !over ||
      active.id === over.id ||
      typeof active.id !== 'string' ||
      typeof over.id !== 'string'
    ) {
      return;
    }

    reorderVisitedPageTab(active.id, over.id);
  };

  if (!tabsVisible) {
    return null;
  }

  return (
    <nav
      aria-label={t('navigation.visited-pages')}
      className="hidden h-12 min-w-0 flex-1 items-center md:flex"
    >
      <div className="flex min-w-0 flex-1 items-center overflow-hidden">
        <VisitedPageTabsContent
          activeTabId={activeTabId}
          items={tabs.map((tab) => tab.id)}
          onDragEnd={handleDragEnd}
          onValueChange={openVisitedPageTab}
          sensors={sensors}
          trailingAction={
            <VisitedPageTabsNewButton onClick={openNewVisitedPageTab} />
          }
        >
          {tabs.map((tab, tabIndex) => {
            const pageLabel = getVisitedPageTabLabel(
              tab.pathname,
              modules,
              labels,
            );
            const activity = findNavigationActivityByPath(
              activities,
              tab.pathname,
            );
            const translatedPageLabel =
              activity?.kind === 'plugin'
                ? i18n.t(pageLabel.toLowerCase().replace(/\s+/g, '-'), {
                    ns: activity.id,
                    defaultValue: pageLabel,
                  })
                : pageLabel;
            // The plugin logo already names the plugin, so the tab shows
            // only the page.
            const label = translatedPageLabel;

            return (
              <SortableVisitedPageTab
                key={tab.id}
                canCloseOtherTabs={tabs.length > 1}
                canCloseTabsToRight={tabIndex < tabs.length - 1}
                closeAriaShortcut={closeAriaShortcut}
                closeAllLabel={t('navigation.close-all-tabs')}
                closeLabel={t('navigation.close-tab', { page: label })}
                closeOtherTabsLabel={t('navigation.close-other-tabs', {
                  defaultValue: 'Close other tabs',
                })}
                closeShortcutLabel={closeShortcutLabel}
                closeTabsToRightLabel={t('navigation.close-tabs-to-right', {
                  defaultValue: 'Close tabs to the right',
                })}
                hideTabsLabel={t('navigation.hide-tabs-row')}
                icon={
                  activity ? (
                    <AppLogo activity={activity} size={14} />
                  ) : (
                    <IconFile className="size-3.5 shrink-0 text-muted-foreground" />
                  )
                }
                isActive={tab.id === activeTabId}
                label={label}
                onClose={() => closeVisitedPageTab(tab.id)}
                onCloseAll={closeAllVisitedPageTabs}
                onCloseOtherTabs={() => closeOtherVisitedPageTabs(tab.id)}
                onCloseTabsToRight={() => closeVisitedPageTabsToRight(tab.id)}
                onHideTabs={() => setTabsVisible(false)}
                tabId={tab.id}
              />
            );
          })}
        </VisitedPageTabsContent>
      </div>
      <VisitedPageTabsShortcutGuide />
    </nav>
  );
};
