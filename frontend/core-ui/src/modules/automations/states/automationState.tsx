import { AutomationBuilderTabsType } from '@/automations/types';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const automationBuilderActiveTabState =
  atomWithStorage<AutomationBuilderTabsType>(
    'activeTab',
    AutomationBuilderTabsType.Builder,
  );

export const automationBuilderSiderbarOpenState = atomWithStorage<boolean>(
  'automationSidebarOpen',
  true,
);

export const automationBuilderPanelOpenState = atomWithStorage<boolean>(
  'automationPanelOpen',
  false,
);

export const toggleAutomationBuilderOpenSidebar = atom(true, (get, set) => {
  const isOpen = get(automationBuilderSiderbarOpenState);

  set(automationBuilderSiderbarOpenState, !isOpen);
});

export const toggleAutomationBuilderOpenPanel = atom(false, (get, set) => {
  const isOpen = get(automationBuilderPanelOpenState);

  set(automationBuilderPanelOpenState, !isOpen);
});

export const automationAiAgentIsStartedTrainingState = atomWithStorage<boolean>(
  'automationAiStartedTraining',
  true,
);
