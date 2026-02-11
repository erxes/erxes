import {
  automationBuilderPanelOpenState,
  automationBuilderSiderbarOpenState,
  toggleAutomationBuilderOpenPanel,
  toggleAutomationBuilderOpenSidebar
} from '@/automations/states/automationState';
import { AutomationsHotKeyScope } from '@/automations/types';
import { usePreviousHotkeyScope } from 'erxes-ui';
import { useAtomValue, useSetAtom } from 'jotai';
import { useMemo } from 'react';

export const useAutomationBilderWorkSpace = () => {
  const isPanelOpen = useAtomValue(automationBuilderPanelOpenState);
  const togglePanelOpen = useSetAtom(toggleAutomationBuilderOpenPanel);
  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope();
  const isOpenSideBar = useAtomValue(automationBuilderSiderbarOpenState);
  const toggleSideBarOpen = useSetAtom(toggleAutomationBuilderOpenSidebar);
  const onOpen = () => {
    togglePanelOpen();
    setHotkeyScopeAndMemorizePreviousScope(AutomationsHotKeyScope.Builder);
  };
  const isMac = useMemo(
    () => /Mac|iPod|iPhone|iPad/.test(navigator.platform),
    [],
  );
  return {
    isPanelOpen,
    togglePanelOpen,
    isOpenSideBar,
    toggleSideBarOpen,
    onOpen,
    isMac,
  };
};
