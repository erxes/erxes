import {
  AUTOMATION_WORKFLOW_TEMPLATE_ADD,
  AUTOMATION_WORKFLOW_TEMPLATE_EDIT,
  AUTOMATION_WORKFLOW_TEMPLATE_REMOVE,
} from '@/automations/graphql/automationMutations';
import { AUTOMATION_WORKFLOW_TEMPLATES } from '@/automations/graphql/automationQueries';
import { TWorkflowInputBindings } from '@/automations/utils/workflowInputs';
import { useMutation, useQuery } from '@apollo/client';
import { TAutomationAction } from 'ui-modules';

export type TWorkflowTemplate = {
  _id: string;
  name: string;
  description?: string;
  entryActionId?: string;
  actions: TAutomationAction[];
  // Default binding expressions for the derived input.* refs in actions
  inputs?: TWorkflowInputBindings;
  createdAt?: string;
};

/**
 * Workflow template CRUD without any builder dependency, so it can be used
 * from the automations list and the standalone template editor as well as
 * from inside the builder.
 */
export const useWorkflowTemplateList = () => {
  const { data, loading } = useQuery<{
    automationWorkflowTemplates: TWorkflowTemplate[];
  }>(AUTOMATION_WORKFLOW_TEMPLATES);

  const [addTemplate, { loading: saving }] = useMutation(
    AUTOMATION_WORKFLOW_TEMPLATE_ADD,
    { refetchQueries: [AUTOMATION_WORKFLOW_TEMPLATES] },
  );
  const [editTemplate, { loading: updatingTemplate }] = useMutation(
    AUTOMATION_WORKFLOW_TEMPLATE_EDIT,
    { refetchQueries: [AUTOMATION_WORKFLOW_TEMPLATES] },
  );
  const [removeTemplateMutation] = useMutation(
    AUTOMATION_WORKFLOW_TEMPLATE_REMOVE,
    { refetchQueries: [AUTOMATION_WORKFLOW_TEMPLATES] },
  );

  const templates = data?.automationWorkflowTemplates || [];

  const removeTemplate = (templateId: string) =>
    removeTemplateMutation({ variables: { _id: templateId } });

  return {
    templates,
    loading,
    saving,
    updatingTemplate,
    addTemplate,
    editTemplate,
    removeTemplate,
  };
};
