import { useAutomationNodeLibraryActionGroupFilter } from '@/automations/components/builder/sidebar/context/AutomationNodeLibraryActionGroupFilterContext';
import {
  getActionGroupBadges,
  TRIGGER_GROUPS,
} from '@/automations/components/builder/sidebar/utils/automationNodeLibrarySidebarUtils';
import { AutomationNodeType } from '@/automations/types';
import { useCallback, useMemo, useState } from 'react';
import { IAutomationsActionConfigConstants } from 'ui-modules';

/** Narrowing the library to one group of actions or triggers. */
export const useAutomationNodeLibrarySidebarFilters = (
  activeNodeTab: AutomationNodeType,
  list: IAutomationsActionConfigConstants[],
) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    activeActionGroup,
    setActiveActionGroup,
    activeTriggerGroup,
    setActiveTriggerGroup,
  } = useAutomationNodeLibraryActionGroupFilter();
  const isAction = activeNodeTab === AutomationNodeType.Action;
  const activeGroup = isAction ? activeActionGroup : activeTriggerGroup;
  const setActiveGroup = isAction
    ? setActiveActionGroup
    : setActiveTriggerGroup;

  const groups = useMemo(
    () => (isAction ? getActionGroupBadges(list) : TRIGGER_GROUPS),
    [isAction, list],
  );

  // Picking the active group again clears it; either way the popover closes
  const chooseGroup = useCallback(
    (group: string | null) => {
      setActiveGroup(group === activeGroup ? null : group);
      setIsOpen(false);
    },
    [activeGroup, setActiveGroup],
  );

  const clearGroup = useCallback(
    () => chooseGroup(activeGroup),
    [chooseGroup, activeGroup],
  );

  return {
    isOpen,
    setIsOpen,
    activeGroup,
    groupOptions: groups.map((group) => ({
      group,
      isActive: group === activeGroup,
      choose: () => chooseGroup(group),
    })),
    clearGroup,
  };
};

/** What the library shows for the open tab. */
export const nodeLibraryTabContentOf = (
  activeNodeTab: AutomationNodeType,
): {
  isWorkflow: boolean;
  listType: AutomationNodeType.Action | AutomationNodeType.Trigger;
} => ({
  isWorkflow: activeNodeTab === AutomationNodeType.Workflow,
  listType:
    activeNodeTab === AutomationNodeType.Action
      ? AutomationNodeType.Action
      : AutomationNodeType.Trigger,
});
