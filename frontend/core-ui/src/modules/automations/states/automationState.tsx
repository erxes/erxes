import {
  AutomationBuilderTabsType,
  AutomationHistorySplitDirection,
  AutomationHistoryViewMode,
} from '@/automations/types';
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

export const automationBuilderActiveTabState = atom<AutomationBuilderTabsType>(
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

export const automationBuilderSecondarySidebarOpenState =
  atomWithStorage<boolean>('automationSecondarySidebarOpen', false);

export const toggleAutomationBuilderOpenSidebar = atom(true, (get, set) => {
  const isOpen = get(automationBuilderSiderbarOpenState);
  set(automationBuilderSiderbarOpenState, !isOpen);
});

export const toggleAutomationBuilderOpenPanel = atom(false, (get, set) => {
  const isOpen = get(automationBuilderPanelOpenState);

  set(automationBuilderPanelOpenState, !isOpen);
});

export const toggleAutomationBuilderSecondarySidebar = atom(
  false,
  (get, set) => {
    const isOpen = get(automationBuilderSecondarySidebarOpenState);

    set(automationBuilderSecondarySidebarOpenState, !isOpen);
  },
);

export const automationCanvasViewState = atomWithStorage<{
  showGrid: boolean;
  showMiniMap: boolean;
}>('automationCanvasView', { showGrid: true, showMiniMap: true });

export const automationCanvasMarqueeModeState = atom<boolean>(false);

export const automationAiAgentIsStartedTrainingState = atomWithStorage<boolean>(
  'automationAiStartedTraining',
  true,
);

export const automationHistoryViewModeState =
  atomWithStorage<AutomationHistoryViewMode>(
    'automationHistoryViewMode',
    AutomationHistoryViewMode.Sheet,
  );

export const automationHistorySplitDirectionState =
  atomWithStorage<AutomationHistorySplitDirection>(
    'automationHistorySplitDirection',
    AutomationHistorySplitDirection.Vertical,
  );

export const automationHistorySelectedExecutionState = atom<{
  automationId: string;
  executionId: string;
} | null>(null);

// export const automationBuilder
