import { WorkflowEditor } from '@/automations/components/builder/nodes/components/WorkflowEditor';
import { useWorkflowTemplateEditView } from '@/automations/hooks/useWorkflowTemplateEditView';
import { Button, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

// Binds the shared workflow editor to a standalone workflow template, so a
// template can be built and edited without living inside an automation.
export const WorkflowTemplateEditView = ({
  templateId,
}: {
  templateId?: string;
}) => {
  const { t } = useTranslation('automations');
  const { loading, notFound, editorKey, scopeId, initial, handleSave, goBack } =
    useWorkflowTemplateEditView(templateId);

  if (loading) {
    return <Spinner />;
  }

  if (notFound) {
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
      key={editorKey}
      scopeId={scopeId}
      initial={initial}
      breadcrumbLabel={t('templates')}
      saveLabel={t('save-template')}
      onSave={handleSave}
      onBack={goBack}
    />
  );
};
