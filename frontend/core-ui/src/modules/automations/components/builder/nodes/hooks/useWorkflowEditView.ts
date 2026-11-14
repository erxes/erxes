import { useWorkflowTemplatePrompt } from '@/automations/components/builder/hooks/useWorkflowTemplatePrompt';
import { TWorkflowEditorValue } from '@/automations/components/builder/nodes/hooks/useWorkflowEditor';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { useCallback, useMemo } from 'react';
import { FieldPath, useFormContext } from 'react-hook-form';

const hasInputs = (inputs?: TWorkflowEditorValue['inputs']) =>
  !!inputs && !!Object.keys(inputs).length;

/**
 * A workflow node of the automation opened in the shared editor. Edits reach
 * the outer form only on Save, and a workflow made from a template then asks
 * whether the template should follow.
 */
export const useWorkflowEditView = (workflowId: string) => {
  const outerForm = useFormContext<TAutomationBuilderForm>();
  const { setEditingWorkflowId } = useAutomation();
  const { workflows } = useAutomationNodes();
  const workflowIndex = (workflows || []).findIndex(
    ({ id }) => id === workflowId,
  );
  const workflow = (workflows || [])[workflowIndex];
  const prompt = useWorkflowTemplatePrompt(workflowId);
  const { hasTemplate, setPromptOpen } = prompt;

  const initial = useMemo(
    () =>
      workflow && {
        name: workflow.name || 'Workflow',
        description: workflow.description || '',
        actions: workflow.actions || [],
        entryActionId: workflow.config?.entryActionId,
        inputs: workflow.config?.inputs || {},
      },
    [workflow],
  );

  const handleSave = useCallback(
    ({
      name,
      description,
      actions,
      entryActionId,
      inputs,
    }: TWorkflowEditorValue) => {
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
        ...(hasInputs(inputs) ? { inputs } : {}),
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

  return {
    initial,
    edgeType: outerForm.getValues('edgeType') ?? 'default',
    flowDirection: outerForm.getValues('flowDirection') ?? 'horizontal',
    handleSave,
    handleBack,
    ...prompt,
  };
};
