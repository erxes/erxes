import {
  TWorkflowEditorValue,
  WorkflowEditor,
} from '@/automations/components/builder/nodes/components/WorkflowEditor';
import { useWorkflowTemplateList } from '@/automations/hooks/useWorkflowTemplateList';
import { Button, Spinner, toast } from 'erxes-ui';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

const TEMPLATES_PATH = '/automations?view=templates';

// Binds the shared workflow editor to a standalone workflow template, so a
// template can be built and edited without living inside an automation.
export const WorkflowTemplateEditView = ({
  templateId,
}: {
  templateId?: string;
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation('automations');
  const { templates, loading, addTemplate, editTemplate } =
    useWorkflowTemplateList();

  const template = templateId
    ? templates.find(({ _id }) => _id === templateId)
    : undefined;

  const goBack = useCallback(() => navigate(TEMPLATES_PATH), [navigate]);

  const handleSave = useCallback(
    async ({
      name,
      description,
      actions,
      entryActionId,
      inputs,
    }: TWorkflowEditorValue) => {
      const variables = {
        name,
        description: description || '',
        entryActionId,
        actions,
        inputs: inputs || {},
      };

      try {
        if (templateId) {
          await editTemplate({ variables: { _id: templateId, ...variables } });
          toast({ title: t('template-updated') });
          return;
        }

        const { data } = await addTemplate({ variables });
        toast({ title: t('template-created') });

        const createdId = data?.automationWorkflowTemplatesAdd?._id;
        if (createdId) {
          navigate(`/automations/templates/${createdId}`, { replace: true });
        }
      } catch (error: any) {
        toast({
          title: templateId
            ? t('template-update-failed')
            : t('template-create-failed'),
          description: error.message,
          variant: 'destructive',
        });
        // Rethrow so the editor keeps the unsaved state for a retry
        throw error;
      }
    },
    [addTemplate, editTemplate, navigate, t, templateId],
  );

  if (loading) {
    return <Spinner />;
  }

  if (templateId && !template) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3">
        <p className="text-sm text-muted-foreground">
          {t('template-not-found')}
        </p>
        <Button variant="outline" onClick={goBack}>
          {t('back-to-templates')}
        </Button>
      </div>
    );
  }

  return (
    <WorkflowEditor
      // Remount on identity change so a freshly created template reloads clean
      key={template?._id || 'create'}
      scopeId={template?._id || 'new-workflow-template'}
      initial={{
        name: template?.name || t('new-workflow'),
        description: template?.description || '',
        actions: template?.actions || [],
        entryActionId: template?.entryActionId,
        inputs: template?.inputs || {},
      }}
      breadcrumbLabel={t('templates')}
      saveLabel={t('save-template')}
      onSave={handleSave}
      onBack={goBack}
    />
  );
};
