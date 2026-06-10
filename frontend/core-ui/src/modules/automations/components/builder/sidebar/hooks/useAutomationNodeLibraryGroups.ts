import { useAutomationNodeLibraryActionGroupFilter } from '@/automations/components/builder/sidebar/context/AutomationNodeLibraryActionGroupFilterContext';
import {
  getActionGroupBadges,
  groupActionsByType,
  groupTriggersByCustomType,
} from '@/automations/components/builder/sidebar/utils/automationNodeLibrarySidebarUtils';
import { AutomationNodeType } from '@/automations/types';
import { useMemo } from 'react';
import {
  IAutomationsActionConfigConstants,
  IAutomationsTriggerConfigConstants,
} from 'ui-modules';

export const useAutomationNodeLibraryGroups = ({
  type,
  list,
}: {
  type: AutomationNodeType.Trigger | AutomationNodeType.Action;
  list:
    | IAutomationsTriggerConfigConstants[]
    | IAutomationsActionConfigConstants[];
}) => {
  const { activeActionGroup, activeTriggerGroup } =
    useAutomationNodeLibraryActionGroupFilter();

  return useMemo(() => {
    if (type === AutomationNodeType.Trigger) {
      return groupTriggersByCustomType({
        triggers: list as IAutomationsTriggerConfigConstants[],
        activeGroup: activeTriggerGroup,
      });
    }

    const actionGroups = getActionGroupBadges(
      list as IAutomationsActionConfigConstants[],
    );

    return groupActionsByType({
      actions: list as IAutomationsActionConfigConstants[],
      groups: actionGroups,
      activeGroup: activeActionGroup,
    });
  }, [activeActionGroup, activeTriggerGroup, list, type]);
};
