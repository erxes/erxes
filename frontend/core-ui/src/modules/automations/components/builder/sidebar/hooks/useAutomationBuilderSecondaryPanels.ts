import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { AutomationSecondaryPanel } from '@/automations/types';
import { supportsErrorPolicy } from '@/automations/utils/automationBuilderUtils/actionFolks';
import { Icon, IconAlertTriangle, IconVariable } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export const useAutomationBuilderSecondaryPanels = () => {
  const { queryParams, actionConstMap, secondaryPanel, setSecondaryPanel } =
    useAutomation();
  const { actions } = useAutomationNodes();
  const { t } = useTranslation('automations');

  const panelMeta: Record<
    AutomationSecondaryPanel,
    { title: string; description: string; icon: Icon }
  > = {
    [AutomationSecondaryPanel.Variables]: {
      title: 'Variables',
      description: t('variables-help-description'),
      icon: IconVariable,
    },
    [AutomationSecondaryPanel.ErrorPolicy]: {
      title: t('error-handling-title'),
      description: t('error-handling-description'),
      icon: IconAlertTriangle,
    },
  };

  const currentAction = actions.find(
    (action) => action.id === queryParams?.activeNodeId,
  );

  const availablePanels = [
    AutomationSecondaryPanel.Variables,
    ...(supportsErrorPolicy(actionConstMap.get(currentAction?.type ?? ''))
      ? [AutomationSecondaryPanel.ErrorPolicy]
      : []),
  ];

  // The choice is kept while a node without that panel is selected, so it
  // comes back on the next node that has it.
  const activePanel =
    secondaryPanel && availablePanels.includes(secondaryPanel)
      ? secondaryPanel
      : null;

  const togglePanel = (panel: AutomationSecondaryPanel) =>
    setSecondaryPanel(activePanel === panel ? null : panel);

  const closePanel = () => setSecondaryPanel(null);

  return {
    availablePanels,
    activePanel,
    panelMeta,
    togglePanel,
    closePanel,
  };
};
