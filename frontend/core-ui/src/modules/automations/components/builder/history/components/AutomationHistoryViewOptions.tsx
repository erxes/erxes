import { useAutomationHistoryView } from '@/automations/components/builder/history/hooks/useAutomationHistoryView';
import {
  AutomationHistorySplitDirection,
  AutomationHistoryViewMode,
} from '@/automations/types';
import {
  IconLayoutColumns,
  IconLayoutRows,
  IconLayoutSidebarRightExpand,
} from '@tabler/icons-react';
import { ToggleGroup } from 'erxes-ui';

export const AutomationHistoryViewModeToggle = () => {
  const { viewMode, changeViewMode } = useAutomationHistoryView();

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      className="ml-auto"
      value={viewMode}
      onValueChange={(value) =>
        value && changeViewMode(value as AutomationHistoryViewMode)
      }
    >
      <ToggleGroup.Item
        value={AutomationHistoryViewMode.Sheet}
        aria-label="Open execution detail in a sheet"
      >
        <IconLayoutSidebarRightExpand />
      </ToggleGroup.Item>
      <ToggleGroup.Item
        value={AutomationHistoryViewMode.Split}
        aria-label="Open execution detail in a split panel"
      >
        <IconLayoutRows />
      </ToggleGroup.Item>
    </ToggleGroup>
  );
};

export const AutomationHistorySplitDirectionToggle = () => {
  const { splitDirection, setSplitDirection } = useAutomationHistoryView();

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      value={splitDirection}
      aria-label="Split direction"
      onValueChange={(value) =>
        value && setSplitDirection(value as AutomationHistorySplitDirection)
      }
    >
      <ToggleGroup.Item
        value={AutomationHistorySplitDirection.Vertical}
        aria-label="Split top and bottom"
      >
        <IconLayoutRows />
      </ToggleGroup.Item>
      <ToggleGroup.Item
        value={AutomationHistorySplitDirection.Horizontal}
        aria-label="Split left and right"
      >
        <IconLayoutColumns />
      </ToggleGroup.Item>
    </ToggleGroup>
  );
};
