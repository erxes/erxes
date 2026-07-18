import {
  AUTOMATION_WORKFLOW_TEMPLATE_ADD,
  AUTOMATION_WORKFLOW_TEMPLATE_EDIT,
  AUTOMATION_WORKFLOW_TEMPLATE_REMOVE,
} from '@/automations/graphql/automationMutations';
import { AUTOMATION_WORKFLOW_TEMPLATES } from '@/automations/graphql/automationQueries';
import {
  TWorkflowTemplate,
  useInsertWorkflowTemplate,
} from '@/automations/components/builder/hooks/useInsertWorkflowTemplate';
import { useAutomationFormController } from '@/automations/hooks/useFormSetValue';
import { useAutomationNodes } from '@/automations/hooks/useAutomationNodes';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { useMutation, useQuery } from '@apollo/client';
import { toast } from 'erxes-ui';
import { Path } from 'react-hook-form';

export type { TWorkflowTemplate };

export const useWorkflowTemplates = () => {
  const { workflows } = useAutomationNodes();
  const { insertTemplate } = useInsertWorkflowTemplate();
  const { setAutomationBuilderFormValue } = useAutomationFormController();

  const { data, loading } = useQuery<{
    automationWorkflowTemplates: TWorkflowTemplate[];
  }>(AUTOMATION_WORKFLOW_TEMPLATES);

  const [addTemplate, { loading: saving }] = useMutation(
    AUTOMATION_WORKFLOW_TEMPLATE_ADD,
    { refetchQueries: [AUTOMATION_WORKFLOW_TEMPLATES] },
  );
  const [editTemplateMutation, { loading: updatingTemplate }] = useMutation(
    AUTOMATION_WORKFLOW_TEMPLATE_EDIT,
    { refetchQueries: [AUTOMATION_WORKFLOW_TEMPLATES] },
  );
  const [removeTemplateMutation] = useMutation(
    AUTOMATION_WORKFLOW_TEMPLATE_REMOVE,
    { refetchQueries: [AUTOMATION_WORKFLOW_TEMPLATES] },
  );

  const templates = data?.automationWorkflowTemplates || [];

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

  const removeTemplate = (templateId: string) => {
    removeTemplateMutation({ variables: { _id: templateId } });
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
