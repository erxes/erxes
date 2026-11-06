import { AlertDialog, Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Blocker } from 'react-router';

export const NotificationTemplateLeaveDialog = ({
  blocker,
}: {
  blocker: Blocker;
}) => {
  const { t } = useTranslation('common', { keyPrefix: 'notification' });

  return (
    <AlertDialog
      open={blocker.state === 'blocked'}
      onOpenChange={(open) => !open && blocker.reset?.()}
    >
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>{t('leave-unsaved-title')}</AlertDialog.Title>
          <AlertDialog.Description>
            {t('leave-unsaved-description')}
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel>{t('keep-editing')}</AlertDialog.Cancel>
          <Button variant="destructive" onClick={() => blocker.proceed?.()}>
            {t('leave-without-saving')}
          </Button>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
};
