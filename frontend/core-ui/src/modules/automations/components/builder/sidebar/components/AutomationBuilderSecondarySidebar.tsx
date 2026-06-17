import { AutomationBuilderNodeOutputVariables } from '@/automations/components/builder/sidebar/components/AutomationBuilderNodeOutputVariables';
import { AutomationBuilderVariablesHelpPopover } from '@/automations/components/builder/sidebar/components/AutomationBuilderVariablesHelpPopover';
import { Card } from 'erxes-ui';

export const AutomationBuilderSecondarySidebar = () => {
  return (
    <div className="flex h-full min-h-0 w-80 shrink-0 flex-col border-l bg-sidebar">
      <Card.Header className="px-5 py-4 border-b">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold">Variables</h3>
          <AutomationBuilderVariablesHelpPopover />
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
