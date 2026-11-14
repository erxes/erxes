import { TWorkflowEditorValue } from '@/automations/components/builder/nodes/components/WorkflowEditor';
import {
  TWorkflowTemplate,
  useWorkflowTemplateList,
} from '@/automations/hooks/useWorkflowTemplateList';
import { toast } from 'erxes-ui';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

const TEMPLATES_PATH = '/automations?view=templates';

const templateVariablesOf = ({
  name,
  description,
  actions,
  entryActionId,
  inputs,
}: TWorkflowEditorValue) => ({
  name,
  description: description || '',
  entryActionId,
  actions,
  inputs: inputs || {},
});

const editorInitialOf = (
  template: TWorkflowTemplate | undefined,
  newName: string,
) => ({
  name: template?.name || newName,
  description: template?.description || '',
  actions: template?.actions || [],
  entryActionId: template?.entryActionId,
  inputs: template?.inputs || {},
});

/**
 * A standalone workflow template in the shared editor: loading it, saving a
 * new or existing one, and going back to the template list.
 */
export const useWorkflowTemplateEditView = (templateId?: string) => {
  const navigate = useNavigate();
  const { t } = useTranslation('automations');
  const { templates, loading, addTemplate, editTemplate } =
    useWorkflowTemplateList();

  const template = templateId
    ? templates.find(({ _id }) => _id === templateId)
    : undefined;

  const goBack = useCallback(() => navigate(TEMPLATES_PATH), [navigate]);

  const createTemplate = useCallback(
    async (variables: ReturnType<typeof templateVariablesOf>) => {
      const { data } = await addTemplate({ variables });
      toast({ title: t('template-created') });

      const createdId = data?.automationWorkflowTemplatesAdd?._id;

      if (createdId) {
        navigate(`/automations/templates/${createdId}`, { replace: true });
      }
    },
    [addTemplate, navigate, t],
  );

  const handleSave = useCallback(
    async (value: TWorkflowEditorValue) => {
      const variables = templateVariablesOf(value);

      try {
        if (templateId) {
          await editTemplate({ variables: { _id: templateId, ...variables } });
          toast({ title: t('template-updated') });
          return;
        }

        await createTemplate(variables);
      } catch (error) {
        toast({
          title: templateId
            ? t('template-update-failed')
            : t('template-create-failed'),
          description: (error as Error).message,
          variant: 'destructive',
        });
        // Rethrow so the editor keeps the unsaved state for a retry
        throw error;
      }
    },
    [createTemplate, editTemplate, t, templateId],
  );

  return {
    loading,
    notFound: !!templateId && !template,
    // Remount on identity change so a freshly created template reloads clean
    editorKey: template?._id || 'create',
    scopeId: template?._id || 'new-workflow-template',
    initial: editorInitialOf(template, t('new-workflow')),
    handleSave,
    goBack,
  };
};
