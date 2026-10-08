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
import { useTranslation } from 'react-i18next';

export const AutomationHistoryViewModeToggle = () => {
  const { t } = useTranslation('automations');
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
        aria-label={t('history-open-in-sheet')}
      >
        <IconLayoutSidebarRightExpand />
      </ToggleGroup.Item>
      <ToggleGroup.Item
        value={AutomationHistoryViewMode.Split}
        aria-label={t('history-open-in-split-panel')}
      >
        <IconLayoutRows />
      </ToggleGroup.Item>
    </ToggleGroup>
  );
};

export const AutomationHistorySplitDirectionToggle = () => {
  const { t } = useTranslation('automations');
  const { splitDirection, setSplitDirection } = useAutomationHistoryView();

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      value={splitDirection}
      aria-label={t('history-split-direction')}
      onValueChange={(value) =>
        value && setSplitDirection(value as AutomationHistorySplitDirection)
      }
    >
      <ToggleGroup.Item
        value={AutomationHistorySplitDirection.Vertical}
        aria-label={t('history-split-top-bottom')}
      >
        <IconLayoutRows />
      </ToggleGroup.Item>
      <ToggleGroup.Item
        value={AutomationHistorySplitDirection.Horizontal}
        aria-label={t('history-split-left-right')}
      >
        <IconLayoutColumns />
      </ToggleGroup.Item>
    </ToggleGroup>
  );
};
