import { useWorkflowTemplates } from '@/automations/components/builder/hooks/useWorkflowTemplates';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { useCallback, useState } from 'react';

// After saving a workflow that was inserted from a template, offers to push
// the saved members back to the source template.
export const useWorkflowTemplatePrompt = (workflowId: string) => {
  const { workflows } = useAutomationNodes();
  const { updateTemplateFromWorkflow } = useWorkflowTemplates();
  const [isPromptOpen, setPromptOpen] = useState(false);

  const templateId = (workflows || []).find(
    ({ id }) => id === workflowId,
  )?.templateId;

  const confirmUpdateTemplate = useCallback(() => {
    updateTemplateFromWorkflow(workflowId);
    setPromptOpen(false);
  }, [updateTemplateFromWorkflow, workflowId]);

  return {
    hasTemplate: !!templateId,
    isPromptOpen,
    setPromptOpen,
    confirmUpdateTemplate,
  };
};
