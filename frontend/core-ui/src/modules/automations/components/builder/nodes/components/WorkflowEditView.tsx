import { WorkflowEditor } from '@/automations/components/builder/nodes/components/WorkflowEditor';
import { useWorkflowEditView } from '@/automations/components/builder/nodes/hooks/useWorkflowEditView';
import { AlertDialog } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

// Binds the shared workflow editor to a workflow node of the automation being
// built. Edits are committed to the outer form only on Save; the automation's
// own Save persists them as usual.
export const WorkflowEditView = ({ workflowId }: { workflowId: string }) => {
  const { t } = useTranslation('automations');
  const {
    initial,
    edgeType,
    flowDirection,
    handleSave,
    handleBack,
    isPromptOpen,
    setPromptOpen,
    confirmUpdateTemplate,
  } = useWorkflowEditView(workflowId);

  if (!initial) {
    return null;
  }

  return (
    <>
      <WorkflowEditor
        scopeId={workflowId}
        initial={initial}
        breadcrumbLabel={t('workflow-breadcrumb-automation')}
        edgeType={edgeType}
        flowDirection={flowDirection}
        onSave={handleSave}
        onBack={handleBack}
      />

      <AlertDialog open={isPromptOpen} onOpenChange={setPromptOpen}>
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>
              {t('workflow-update-template-title')}
            </AlertDialog.Title>
            <AlertDialog.Description>
              {t('workflow-update-template-description')}
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel>
              {t('workflow-update-template-only-this')}
            </AlertDialog.Cancel>
            <AlertDialog.Action onClick={confirmUpdateTemplate}>
              {t('workflow-update-template-confirm')}
            </AlertDialog.Action>
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog>
    </>
  );
};
