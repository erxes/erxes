import { MutableRefObject } from 'react';
import { AlertDialog } from 'erxes-ui';
import { useCmsUnsavedChangesAlert } from '~/modules/cms/shared/hooks/useCmsUnsavedChangesAlert';

/** Discard-confirmation dialog shown when navigating away from unsaved edits. */
export const CmsUnsavedChangesAlert = ({
  isDirty,
  bypassRef,
}: {
  isDirty: boolean;
  bypassRef?: MutableRefObject<boolean>;
}) => {
  const { blocker, isProceeding, isProceedingRef, t, proceedWithoutSaving } =
    useCmsUnsavedChangesAlert({ isDirty, bypassRef });

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
          <AlertDialog.Action onClick={proceedWithoutSaving}>
            {t('leave-without-saving')}
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
};
