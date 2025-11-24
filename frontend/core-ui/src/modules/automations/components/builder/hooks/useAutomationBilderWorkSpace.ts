import { useAtomValue, useSetAtom } from 'jotai';
import { useMemo } from 'react';
import { toggleAutomationBuilderOpenPanel } from '@/automations/states/automationState';
import { automationBuilderPanelOpenState } from '@/automations/states/automationState';
import { usePreviousHotkeyScope } from 'erxes-ui';
import { automationBuilderSiderbarOpenState } from '@/automations/states/automationState';
import { toggleAutomationBuilderOpenSidebar } from '@/automations/states/automationState';
import { AutomationsHotKeyScope } from '@/automations/types';

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
