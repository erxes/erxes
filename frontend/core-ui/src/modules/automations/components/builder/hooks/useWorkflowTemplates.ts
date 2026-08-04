import {
  TWorkflowTemplate,
  useInsertWorkflowTemplate,
} from '@/automations/components/builder/hooks/useInsertWorkflowTemplate';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { useWorkflowTemplateList } from '@/automations/hooks/useWorkflowTemplateList';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { toast } from 'erxes-ui';
import { Path } from 'react-hook-form';

export type { TWorkflowTemplate };

export const useWorkflowTemplates = () => {
  const { workflows } = useAutomationNodes();
  const { insertTemplate } = useInsertWorkflowTemplate();
  const { setAutomationBuilderFormValue } = useAutomationFormController();

  const {
    templates,
    loading,
    saving,
    updatingTemplate,
    addTemplate,
    editTemplate: editTemplateMutation,
    removeTemplate,
  } = useWorkflowTemplateList();

  const saveAsTemplate = async (workflowNodeId: string) => {
    const workflowIndex = (workflows || []).findIndex(
      ({ id }) => id === workflowNodeId,
    );
    const workflow = (workflows || [])[workflowIndex];

    if (!workflow?.actions?.length) {
      return;
    }

    try {
      const { data: added } = await addTemplate({
        variables: {
          name: workflow.name,
          description: workflow.description || '',
          entryActionId: workflow.config?.entryActionId,
          actions: workflow.actions,
          inputs: workflow.config?.inputs || {},
        },
      });

      // Link the source workflow to its new template so later edits can
      // offer to update it
      const templateId = added?.automationWorkflowTemplatesAdd?._id;
      if (templateId) {
        setAutomationBuilderFormValue(
          `workflows.${workflowIndex}.templateId` as Path<TAutomationBuilderForm>,
          templateId,
        );
      }

      toast({ title: `Saved "${workflow.name}" as template` });
    } catch (error: any) {
      toast({
        title: 'Failed to save template',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Pushes the workflow's current members/inputs back to its source template
  const updateTemplateFromWorkflow = async (workflowNodeId: string) => {
    const workflow = (workflows || []).find(({ id }) => id === workflowNodeId);

    if (!workflow?.templateId) {
      return;
    }

    try {
      await editTemplateMutation({
        variables: {
          _id: workflow.templateId,
          entryActionId: workflow.config?.entryActionId,
          actions: workflow.actions || [],
          inputs: workflow.config?.inputs || {},
        },
      });
      toast({ title: 'Template updated' });
    } catch (error: any) {
      toast({
        title: 'Failed to update template',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return {
    templates,
    loading,
    saving,
    updatingTemplate,
    saveAsTemplate,
    updateTemplateFromWorkflow,
    removeTemplate,
    insertTemplate,
  };
};
