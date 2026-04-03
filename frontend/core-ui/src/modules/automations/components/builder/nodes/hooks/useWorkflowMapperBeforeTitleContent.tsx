import { AutomationNodeType } from '@/automations/types';
import { Checkbox } from 'erxes-ui';

export const useWorkflowMapperBeforeTitleContent = (
  selectedActionIds: string[],
  onSelectActionWorkflow: (actionId: string, checked: boolean) => void,
) => {
  const beforeTitleContent = (id: string, type: AutomationNodeType) => {
    return (
      <Checkbox
        checked={selectedActionIds.includes(id)}
        onCheckedChange={(checked) =>
          onSelectActionWorkflow(id, Boolean(checked))
        }
        className="data-[state=checked]:border-success data-[state=indeterminate]:border-success data-[state=checked]:bg-success data-[state=indeterminate]:bg-success"
      />
    );
  };

  return { beforeTitleContent };
};
