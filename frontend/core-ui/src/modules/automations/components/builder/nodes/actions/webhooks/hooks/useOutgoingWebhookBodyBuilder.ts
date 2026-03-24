import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { getTriggerOfAction } from '@/automations/utils/automationBuilderUtils/triggerUtils';
import { useMemo } from 'react';
import { TAutomationAction, useAttributes } from 'ui-modules';

export const useOutgoingWebhookBodyBuilder = (
  currentAction: TAutomationAction,
) => {
  const { actionFolks } = useAutomation();
  const { actions, triggers } = useAutomationNodes();
  const trigger = useMemo(
    () =>
      currentAction.id
        ? getTriggerOfAction(currentAction.id, actions, triggers, actionFolks)
        : undefined,
    [currentAction.id, actions, triggers, actionFolks],
  );
  const { attributes } = useAttributes({
    contentType: trigger?.type,
    attributesConfig: trigger?.config?.attributesConfig,
  });

  const attributeSuggestions = useMemo(() => {
    if (!attributes?.length) return [];

    return attributes.map((attr: any) => ({
      label: attr.label || attr.name,
      kind: 1, // CompletionItemKind.Text
      insertText: `{{ ${attr.name} }}`,
      documentation: attr.description || attr.label,
      detail: attr.type,
    }));
  }, [attributes]);

  return {
    attributeSuggestions,
  };
};
