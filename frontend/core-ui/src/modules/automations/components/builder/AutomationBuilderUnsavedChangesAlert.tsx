import { AlertDialog } from 'erxes-ui';
import { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useBlocker } from 'react-router';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { useTranslation } from 'react-i18next';

export const AutomationBuilderUnsavedChangesAlert = () => {
  const {
    formState: { isDirty },
  } = useFormContext<TAutomationBuilderForm>();
  const { t } = useTranslation('automations');
  const isProceedingRef = useRef(false);
  const [isProceeding, setIsProceeding] = useState(false);

  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    const currentLocationPathName = currentLocation.pathname;
    const nextLocationPathName = nextLocation.pathname;

    if (
      currentLocationPathName === '/automations/create' &&
      nextLocationPathName.startsWith('/automations/edit/')
    ) {
      return false;
    }

    return isDirty && nextLocationPathName !== currentLocationPathName;
  });

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

  useEffect(() => {
    if (blocker.state === 'unblocked') {
      isProceedingRef.current = false;
      setIsProceeding(false);
    }
  }, [blocker.state]);

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
          <AlertDialog.Action
            onClick={() => {
              if (blocker.state === 'blocked') {
                isProceedingRef.current = true;
                setIsProceeding(true);
                blocker.proceed();
              }
            }}
          >
            {t('leave-without-saving')}
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
};
