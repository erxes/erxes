import { AutomationNodeType, NodeData } from '@/automations/types';

// Custom hook for trigger node content logic
export const useNodeContent = (
  data: NodeData,
  nodeType: AutomationNodeType,
) => {
  const hasError = Boolean(data?.error);
  const isCustom =
    nodeType === AutomationNodeType.Trigger ? data.isCustom : true;
  const hasConfig = Boolean(Object.keys(data?.config || {}).length);

  return {
    hasError,
    isCustom,
    hasConfig,
    shouldRender: isCustom && hasConfig && !hasError,
  };
};
