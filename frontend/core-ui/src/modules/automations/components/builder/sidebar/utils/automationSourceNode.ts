import { AutomationNodeType } from '@/automations/types';

export const checkAutomationNodeSupportedSourceNode = (
  nodeType?: AutomationNodeType,
) => {
  if (!nodeType) {
    return false;
  }
  const isSupportedSourceNode =
    nodeType === AutomationNodeType.Trigger ||
    nodeType === AutomationNodeType.Action;

  return isSupportedSourceNode;
};
