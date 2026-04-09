import { AlertDialog } from 'erxes-ui';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useBlocker, useLocation } from 'react-router';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';

export const AutomationBuilderUnsavedChangesAlert = () => {
  const location = useLocation();
  const {
    formState: { isDirty },
  } = useFormContext<TAutomationBuilderForm>();

  const blocker = useBlocker(
    ({ nextLocation }) =>
      isDirty && nextLocation.pathname !== location.pathname,
  );

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) {
        return;
      }

      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  return (
    <AlertDialog
      open={blocker.state === 'blocked'}
      onOpenChange={(open) => {
        if (!open && blocker.state === 'blocked') {
          blocker.reset();
        }
      }}
    >
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>Discard unsaved changes?</AlertDialog.Title>
          <AlertDialog.Description>
            You have unsaved changes in this automation. If you leave now, your
            edits will be lost.
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel>Stay here</AlertDialog.Cancel>
          <AlertDialog.Action
            onClick={() => {
              if (blocker.state === 'blocked') {
                blocker.proceed();
              }
            }}
          >
            Leave without saving
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
};
