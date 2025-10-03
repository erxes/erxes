import { AutomationBuilderTabsType } from '@/automations/types';
import { atom } from 'jotai';

export const automationBuilderActiveTabState = atom<AutomationBuilderTabsType>(
  AutomationBuilderTabsType.Builder,
);

export const automationBuilderSiderbarOpenState = atom<boolean>(true);

export const automationBuilderPanelOpenState = atom<boolean>(false);

export const toggleAutomationBuilderOpenSidebar = atom(true, (get, set) => {
  const isOpen = get(automationBuilderSiderbarOpenState);

  set(automationBuilderSiderbarOpenState, !isOpen);
});

export const toggleAutomationBuilderOpenPanel = atom(false, (get, set) => {
  const isOpen = get(automationBuilderPanelOpenState);

  set(automationBuilderPanelOpenState, !isOpen);
});
