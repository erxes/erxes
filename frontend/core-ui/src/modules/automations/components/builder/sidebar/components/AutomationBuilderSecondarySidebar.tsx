import { AutomationBuilderNodeOutputVariables } from '@/automations/components/builder/sidebar/components/AutomationBuilderNodeOutputVariables';
import { AutomationBuilderSidebarHeaderActions } from '@/automations/components/builder/sidebar/components/AutomationBuilderSidebarHeaderActions';
import { AutomationBuilderVariablesHelpPopover } from '@/automations/components/builder/sidebar/components/AutomationBuilderVariablesHelpPopover';
import { Card, cn } from 'erxes-ui';

export const AutomationBuilderSecondarySidebar = ({
  className,
  handleBack,
  handleClose,
}: {
  className?: string;
  handleBack?: () => void;
  handleClose?: () => void;
}) => {
  return (
    <div
      className={cn(
        'flex h-full min-h-0 w-80 shrink-0 flex-col border-l bg-sidebar',
        className,
      )}
    >
      <Card.Header className="px-5 py-4 border-b">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold">Variables</h3>
          <div className="flex items-center gap-2">
            <AutomationBuilderVariablesHelpPopover />
            <AutomationBuilderSidebarHeaderActions
              canShowSecondarySidebar={false}
              handleBack={handleBack}
              handleClose={handleClose}
            />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Output variables panel will live here.
        </p>
      </Card.Header>
      <Card.Content className="min-h-0 flex-1 overflow-y-auto p-0">
        <AutomationBuilderNodeOutputVariables />
      </Card.Content>
    </div>
  );
};
