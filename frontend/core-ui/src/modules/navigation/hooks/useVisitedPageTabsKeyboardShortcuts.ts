import { visitedPageTabsVisibleState } from '@/navigation/states/visitedPageTabsState';
import { IVisitedPageTab } from '@/navigation/types/VisitedPageTab';
import { getAdjacentVisitedPageTabId } from '@/navigation/utils/visitedPageTabs';
import {
  getVisitedPageTabShortcut,
  isVisitedPageTabShortcutTargetEditable,
} from '@/navigation/utils/visitedPageTabShortcuts';
import { Sidebar } from 'erxes-ui';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';

export const useVisitedPageTabsKeyboardShortcuts = ({
  activeTabId,
  closeAllTabs,
  closeTab,
  openTab,
  tabs,
}: Readonly<{
  activeTabId: string | null;
  closeAllTabs: () => void;
  closeTab: (tabId: string) => void;
  openTab: (tabId: string) => void;
  tabs: IVisitedPageTab[];
}>) => {
  const setTabsVisible = useSetAtom(visitedPageTabsVisibleState);
  const { toggleSidebar } = Sidebar.useSidebar();

  useEffect(() => {
    const handleTabShortcut = (
      event: KeyboardEvent,
      tabShortcut: NonNullable<ReturnType<typeof getVisitedPageTabShortcut>>,
    ) => {
      event.preventDefault();

      if (event.repeat) {
        return;
      }

      if (tabShortcut === 'toggle-visibility') {
        setTabsVisible((visible) => !visible);
        return;
      }

      if (tabShortcut === 'close-all') {
        closeAllTabs();
        return;
      }

      if (tabShortcut === 'close-current') {
        if (activeTabId) {
          closeTab(activeTabId);
        }

        return;
      }

      const destinationTabId = getAdjacentVisitedPageTabId(
        tabs,
        activeTabId,
        tabShortcut,
      );

      if (destinationTabId) {
        openTab(destinationTabId);
      }
    };

    const handleKeyboardShortcut = (event: KeyboardEvent) => {
      if (isVisitedPageTabShortcutTargetEditable(event.target)) {
        return;
      }

      const tabShortcut = getVisitedPageTabShortcut(event);

      if (tabShortcut) {
        handleTabShortcut(event, tabShortcut);
        return;
      }

      if (!event.metaKey && !event.ctrlKey) {
        return;
      }

      if (event.key === '\\') {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyboardShortcut);

    return () => window.removeEventListener('keydown', handleKeyboardShortcut);
  }, [
    activeTabId,
    closeAllTabs,
    closeTab,
    openTab,
    setTabsVisible,
    tabs,
    toggleSidebar,
  ]);
};
