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

export type TAutomationEdgeInsertTarget = {
  source: string;
  sourceHandle: string | null;
  target: string;
};

/**
 * The edge a node is about to be inserted into. Set by the edge's insert
 * button so the node library knows the pick lands mid-flow instead of being
 * appended at the end.
 */
export const automationEdgeInsertTargetState =
  atom<TAutomationEdgeInsertTarget | null>(null);

/**
 * The edge a canvas node is currently hovering over while being dragged.
 * Node drags run on pointer events, so the edge cannot learn about them from
 * a drop handler of its own.
 */
export const automationInsertHoverEdgeIdState = atom<string | null>(null);
