import { useAutomationBuilderSecondaryPanels } from '@/automations/components/builder/sidebar/hooks/useAutomationBuilderSecondaryPanels';
import { useAutomationBuilderSidebarHooks } from '@/automations/components/builder/sidebar/hooks/useAutomationBuilderSidebarHooks';
import { useAutomationVariableDragFeedback } from '@/automations/components/builder/sidebar/hooks/useAutomationVariableDragFeedback';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { AutomationsHotKeyScope } from '@/automations/types';
import {
  useIsMobile,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useSetHotkeyScope,
} from 'erxes-ui';
import { useCallback, useEffect } from 'react';

/**
 * The builder sidebar: open and closed by hotkeys, opened by itself while a
 * node waits to be connected, and drawn as a sheet on narrow screens.
 */
export const useAutomationBuilderSidebar = () => {
  const isMobile = useIsMobile();
  const { awaitingToConnectNodeId } = useAutomation();
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  const setHotkeyScope = useSetHotkeyScope();
  const sidebar = useAutomationBuilderSidebarHooks();
  const { isOpenSideBar, toggleSideBarOpen, handleClose } = sidebar;
  const { activePanel, closePanel } = useAutomationBuilderSecondaryPanels();
  useAutomationVariableDragFeedback();

  useEffect(() => {
    if (!isOpenSideBar && awaitingToConnectNodeId) {
      toggleSideBarOpen();
    }
    // Opens once per node waiting to be connected
  }, [awaitingToConnectNodeId]);

  const onOpen = useCallback(() => {
    toggleSideBarOpen();
    setHotkeyScopeAndMemorizePreviousScope(AutomationsHotKeyScope.Builder);
  }, [toggleSideBarOpen, setHotkeyScopeAndMemorizePreviousScope]);

  const onClose = useCallback(() => {
    if (isOpenSideBar) {
      setHotkeyScope(AutomationsHotKeyScope.Builder);
      toggleSideBarOpen();
    }
  }, [isOpenSideBar, setHotkeyScope, toggleSideBarOpen]);

  useScopedHotkeys(`mod+g`, onOpen, AutomationsHotKeyScope.Builder);
  useScopedHotkeys(`mod+esc`, onClose, AutomationsHotKeyScope.Builder);

  const onSheetOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        handleClose();
      }
    },
    [handleClose],
  );

  return { ...sidebar, isMobile, activePanel, closePanel, onSheetOpenChange };
};
