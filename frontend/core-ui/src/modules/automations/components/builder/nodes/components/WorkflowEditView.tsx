import { useWorkflowTemplatePrompt } from '@/automations/components/builder/hooks/useWorkflowTemplatePrompt';
import {
  TWorkflowEditorValue,
  WorkflowEditor,
} from '@/automations/components/builder/nodes/components/WorkflowEditor';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { AlertDialog } from 'erxes-ui';
import { useCallback } from 'react';
import { FieldPath, useFormContext } from 'react-hook-form';

// Binds the shared workflow editor to a workflow node of the automation being
// built. Edits are committed to the outer form only on Save; the automation's
// own Save persists them as usual.
export const WorkflowEditView = ({ workflowId }: { workflowId: string }) => {
  const outerForm = useFormContext<TAutomationBuilderForm>();
  const { setEditingWorkflowId } = useAutomation();
  const { workflows } = useAutomationNodes();

  const workflowIndex = (workflows || []).findIndex(
    ({ id }) => id === workflowId,
  );
  const workflow = (workflows || [])[workflowIndex];

  const { hasTemplate, isPromptOpen, setPromptOpen, confirmUpdateTemplate } =
    useWorkflowTemplatePrompt(workflowId);

  const handleSave = useCallback(
    ({ name, description, actions, entryActionId, inputs }: TWorkflowEditorValue) => {
      if (workflowIndex < 0) {
        return;
      }

      const setWorkflowValue = (key: string, value: unknown) =>
        outerForm.setValue(
          `workflows.${workflowIndex}.${key}` as FieldPath<TAutomationBuilderForm>,
          value as never,
          { shouldDirty: true },
        );

      setWorkflowValue('name', name);
      setWorkflowValue('description', description ?? '');
      setWorkflowValue('actions', actions);
      setWorkflowValue('config', {
        ...(workflow?.config || {}),
        entryActionId,
        ...(inputs && Object.keys(inputs).length ? { inputs } : {}),
      });

      if (hasTemplate) {
        setPromptOpen(true);
      }
    },
    [workflowIndex, outerForm, workflow?.config, hasTemplate, setPromptOpen],
  );

  const handleBack = useCallback(
    () => setEditingWorkflowId(null),
    [setEditingWorkflowId],
  );

  if (!workflow) {
    return null;
  }

  return (
    <>
      <WorkflowEditor
        scopeId={workflowId}
        initial={{
          name: workflow.name || 'Workflow',
          description: workflow.description || '',
          actions: workflow.actions || [],
          entryActionId: workflow.config?.entryActionId,
          inputs: workflow.config?.inputs || {},
        }}
        breadcrumbLabel="Automation"
        edgeType={outerForm.getValues('edgeType') ?? 'default'}
        flowDirection={outerForm.getValues('flowDirection') ?? 'horizontal'}
        onSave={handleSave}
        onBack={handleBack}
      />

      <AlertDialog open={isPromptOpen} onOpenChange={setPromptOpen}>
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>Update template?</AlertDialog.Title>
            <AlertDialog.Description>
              This workflow was inserted from a template. Apply the saved edits
              to the template as well, or keep them only in this automation?
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel>Only this automation</AlertDialog.Cancel>
            <AlertDialog.Action onClick={confirmUpdateTemplate}>
              Update template
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </>
  );
};
