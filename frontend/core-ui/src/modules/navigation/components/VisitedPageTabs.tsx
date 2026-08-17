import { SortableVisitedPageTab } from '@/navigation/components/visited-page-tabs/SortableVisitedPageTab';
import { VisitedPageTabsContent } from '@/navigation/components/visited-page-tabs/VisitedPageTabsContent';
import { VisitedPageTabsNewButton } from '@/navigation/components/visited-page-tabs/VisitedPageTabsNewButton';
import { VisitedPageTabsShortcutGuide } from '@/navigation/components/VisitedPageTabsShortcutGuide';
import { useNavigationActivities } from '@/navigation/hooks/useNavigationActivities';
import { usePluginsModules } from '@/navigation/hooks/usePluginsModules';
import { useVisitedPageTabs } from '@/navigation/hooks/useVisitedPageTabs';
import { useVisitedPageTabsKeyboardShortcuts } from '@/navigation/hooks/useVisitedPageTabsKeyboardShortcuts';
import { visitedPageTabsVisibleState } from '@/navigation/states/visitedPageTabsState';
import { findNavigationActivityByPath } from '@/navigation/utils/navigationActivities';
import {
  getVisitedPageTabLabel,
  getVisitedPageTabTitle,
} from '@/navigation/utils/visitedPageTabs';
import { isMacPlatform } from '@/navigation/utils/visitedPageTabShortcuts';
import { GlobalSearchTrigger } from '@/search/components/GlobalSearchTrigger';
import {
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import {
  IconApps,
  IconFile,
  IconLayoutNavbarCollapse,
} from '@tabler/icons-react';
import { Button } from 'erxes-ui';
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
    closeVisitedPageTab,
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
  const toggleTabsAriaShortcut = isMac ? 'Meta+Alt+T' : 'Control+Alt+T';
  const toggleTabsShortcutLabel = isMac ? '⌘ ⌥ T' : 'Ctrl Alt T';

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
      className="fixed inset-x-0 top-0 z-40 flex h-10 items-center gap-1.5 border-b bg-muted px-2"
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
          {tabs.map((tab) => {
            const pageLabel = getVisitedPageTabLabel(
              tab.pathname,
              modules,
              labels,
            );
            const activity = findNavigationActivityByPath(
              activities,
              tab.pathname,
            );
            const Icon = activity ? activity.icon || IconApps : IconFile;
            const translatedPageLabel =
              activity?.kind === 'plugin'
                ? i18n.t(pageLabel.toLowerCase().replace(/\s+/g, '-'), {
                    ns: activity.id,
                    defaultValue: pageLabel,
                  })
                : pageLabel;
            const label = getVisitedPageTabTitle(
              translatedPageLabel,
              activity?.kind === 'plugin' ? activity.label : undefined,
            );

            return (
              <SortableVisitedPageTab
                key={tab.id}
                closeAriaShortcut={closeAriaShortcut}
                closeAllLabel={t('navigation.close-all-tabs')}
                closeLabel={t('navigation.close-tab', { page: label })}
                closeShortcutLabel={closeShortcutLabel}
                hideTabsLabel={t('navigation.hide-tabs-row')}
                icon={Icon}
                isActive={tab.id === activeTabId}
                label={label}
                onClose={() => closeVisitedPageTab(tab.id)}
                onCloseAll={closeAllVisitedPageTabs}
                onHideTabs={() => setTabsVisible(false)}
                tabId={tab.id}
              />
            );
          })}
        </VisitedPageTabsContent>
      </div>
      <GlobalSearchTrigger />
      <Button
        aria-keyshortcuts={toggleTabsAriaShortcut}
        aria-label={t('navigation.hide-tabs-row')}
        className="size-8 shrink-0 text-muted-foreground"
        onClick={() => setTabsVisible(false)}
        size="icon"
        title={`${t('navigation.hide-tabs-row')} (${toggleTabsShortcutLabel})`}
        type="button"
        variant="ghost"
      >
        <IconLayoutNavbarCollapse className="size-4" />
      </Button>
      <VisitedPageTabsShortcutGuide />
    </nav>
  );
};
