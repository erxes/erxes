import { useWorkflowTemplates } from '@/automations/components/builder/hooks/useWorkflowTemplates';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { useCallback, useRef, useState } from 'react';

// When a workflow inserted from a template is edited in the sheet and the
// sheet closes, offers to push the edits back to the source template.
export const useWorkflowTemplatePrompt = (workflowId: string) => {
  const { workflows } = useAutomationNodes();
  const { updateTemplateFromWorkflow } = useWorkflowTemplates();
  const [isPromptOpen, setPromptOpen] = useState(false);
  const isDirtyRef = useRef(false);

  const templateId = (workflows || []).find(
    ({ id }) => id === workflowId,
  )?.templateId;

  const markMembersChanged = useCallback(() => {
    isDirtyRef.current = true;
  }, []);

  const handleSheetOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        isDirtyRef.current = false;
        return;
      }

      if (isDirtyRef.current && templateId) {
        setPromptOpen(true);
      }
    },
    [templateId],
  );

  const confirmUpdateTemplate = useCallback(() => {
    updateTemplateFromWorkflow(workflowId);
    setPromptOpen(false);
  }, [updateTemplateFromWorkflow, workflowId]);

  return {
    isPromptOpen,
    setPromptOpen,
    markMembersChanged,
    handleSheetOpenChange,
    confirmUpdateTemplate,
  };
};
