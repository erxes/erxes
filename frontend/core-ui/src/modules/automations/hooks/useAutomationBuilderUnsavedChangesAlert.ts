import { useClearUnsavedSegments } from '@/automations/hooks/useClearUnsavedSegments';
import { TAutomationBuilderForm } from '@/automations/utils/automationFormDefinitions';
import { useEffect, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useBlocker } from 'react-router';

export const useAutomationBuilderUnsavedChangesAlert = () => {
  const {
    formState: { isDirty },
  } = useFormContext<TAutomationBuilderForm>();
  const { t } = useTranslation('automations');
  const isProceedingRef = useRef(false);
  const [isProceeding, setIsProceeding] = useState(false);
  const { clearUnsavedSegments } = useClearUnsavedSegments();

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

  const processWithoutSaving = async () => {
    if (blocker.state !== 'blocked') {
      return;
    }

    isProceedingRef.current = true;
    setIsProceeding(true);

    try {
      await clearUnsavedSegments();
    } finally {
      blocker.proceed();
    }
  };

  return {
    blocker,
    isProceeding,
    isProceedingRef,
    t,
    processWithoutSaving,
  };
};
