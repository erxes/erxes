import { useAutomationBuilderSecondaryPanels } from '@/automations/components/builder/sidebar/hooks/useAutomationBuilderSecondaryPanels';
import { IconCheck } from '@tabler/icons-react';
import { DropdownMenu } from 'erxes-ui';

export const AutomationBuilderSecondaryPanelMenuItems = () => {
  const { availablePanels, activePanel, panelMeta, togglePanel } =
    useAutomationBuilderSecondaryPanels();

  return (
    <>
      {availablePanels.map((panel) => {
        const { title, icon: PanelIcon } = panelMeta[panel];

        return (
          <DropdownMenu.Item key={panel} onClick={() => togglePanel(panel)}>
            <PanelIcon />
            <span className="flex-auto">{title}</span>
            {activePanel === panel && <IconCheck />}
          </DropdownMenu.Item>
        );
      })}
    </>
  );
};
