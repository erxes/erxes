import { useAutomationBuilderUnsavedChangesAlert } from '@/automations/hooks/useAutomationBuilderUnsavedChangesAlert';
import { IAutomation } from '@/automations/types';
import { AlertDialog } from 'erxes-ui';

export const AutomationBuilderUnsavedChangesAlert = ({
  detail,
}: {
  detail?: IAutomation;
}) => {
  const { blocker, isProceeding, isProceedingRef, t, processWithoutSaving } =
    useAutomationBuilderUnsavedChangesAlert(detail);

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
          <AlertDialog.Title>{t('unsaved-changes-title')}</AlertDialog.Title>
          <AlertDialog.Description>
            {t('unsaved-changes-description')}
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel>{t('stay-here')}</AlertDialog.Cancel>
          <AlertDialog.Action onClick={processWithoutSaving}>
            {t('leave-without-saving')}
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
};
