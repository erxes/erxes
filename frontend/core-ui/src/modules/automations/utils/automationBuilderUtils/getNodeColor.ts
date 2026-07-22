import { AutomationNodeType } from '@/automations/types';

export const getNodeColor = (nodeType: AutomationNodeType) => ({
  'bg-success/10 text-success': nodeType === AutomationNodeType.Action,
  'bg-primary/10 text-primary': nodeType === AutomationNodeType.Trigger,
  'bg-muted/10 text-muted-foreground': !nodeType,
  'bg-info/10 text-info': nodeType === AutomationNodeType.Workflow,
});
