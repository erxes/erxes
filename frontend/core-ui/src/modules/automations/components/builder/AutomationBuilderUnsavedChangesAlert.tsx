import { useAutomationBuilderUnsavedChangesAlert } from '@/automations/hooks/useAutomationBuilderUnsavedChangesAlert';
import { AlertDialog } from 'erxes-ui';

export const AutomationBuilderUnsavedChangesAlert = () => {
  const { blocker, isProceeding, isProceedingRef, t, processWithoutSaving } =
    useAutomationBuilderUnsavedChangesAlert();

  return (
    <AlertDialog
      open={blocker.state === 'blocked' && !isProceeding}
      onOpenChange={(open) => {
        if (!open && blocker.state === 'blocked' && !isProceedingRef.current) {
          blocker.reset();
        }
      }}
    >
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>{t('unsaved-changes-title', 'Discard unsaved changes?')}</AlertDialog.Title>
          <AlertDialog.Description>
            {t('unsaved-changes-description', 'You have unsaved changes in this automation. If you leave now, your edits will be lost.')}
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel>{t('stay-here', 'Stay here')}</AlertDialog.Cancel>
          <AlertDialog.Action onClick={processWithoutSaving}>
            {t('leave-without-saving', 'Leave without saving')}
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
};
