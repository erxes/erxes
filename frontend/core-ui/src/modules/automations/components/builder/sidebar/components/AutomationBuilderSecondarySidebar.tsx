import { AutomationBuilderErrorPolicy } from '@/automations/components/builder/sidebar/components/AutomationBuilderErrorPolicy';
import { AutomationBuilderNodeOutputVariables } from '@/automations/components/builder/sidebar/components/AutomationBuilderNodeOutputVariables';
import { AutomationBuilderSidebarHeaderActions } from '@/automations/components/builder/sidebar/components/AutomationBuilderSidebarHeaderActions';
import { AutomationBuilderVariablesHelpPopover } from '@/automations/components/builder/sidebar/components/AutomationBuilderVariablesHelpPopover';
import { useAutomationBuilderSecondaryPanels } from '@/automations/components/builder/sidebar/hooks/useAutomationBuilderSecondaryPanels';
import { AutomationSecondaryPanel } from '@/automations/types';
import { Card, cn } from 'erxes-ui';
import { ComponentType } from 'react';

const PANEL_CONTENT: Record<AutomationSecondaryPanel, ComponentType> = {
  [AutomationSecondaryPanel.Variables]: AutomationBuilderNodeOutputVariables,
  [AutomationSecondaryPanel.ErrorPolicy]: AutomationBuilderErrorPolicy,
};

export const AutomationBuilderSecondarySidebar = ({
  panel,
  className,
  handleBack,
  handleClose,
}: {
  panel: AutomationSecondaryPanel;
  className?: string;
  handleBack?: () => void;
  handleClose?: () => void;
}) => {
  const { panelMeta } = useAutomationBuilderSecondaryPanels();
  const { title, description } = panelMeta[panel];
  const PanelContent = PANEL_CONTENT[panel];

  return (
    <div
      className={cn(
        'flex h-full min-h-0 w-80 shrink-0 flex-col border-l bg-sidebar',
        className,
      )}
    >
      <Card.Header className="px-5 py-4 border-b">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold">{title}</h3>
          <div className="flex items-center gap-2">
            {panel === AutomationSecondaryPanel.Variables && (
              <AutomationBuilderVariablesHelpPopover />
            )}
            <AutomationBuilderSidebarHeaderActions
              canShowSecondarySidebar={false}
              handleBack={handleBack}
              handleClose={handleClose}
            />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </Card.Header>
      <Card.Content className="min-h-0 flex-1 overflow-y-auto p-0">
        <PanelContent />
      </Card.Content>
    </div>
  );
};
