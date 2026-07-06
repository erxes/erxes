import { MutableRefObject, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useBlocker } from 'react-router-dom';

/**
 * Blocks in-app navigation and page unloads while the form has unsaved
 * changes, exposing the blocker state for a discard-confirmation dialog.
 */
export const useCmsUnsavedChangesAlert = ({
  isDirty,
  bypassRef,
}: {
  isDirty: boolean;
  /**
   * When set to true, the guard stands down. A successful save flips this ref
   * right before it navigates away — the reset that cleans the form and the
   * navigation happen in the same tick, before the next render, so the
   * blocker's captured `isDirty` would still be stale `true` without it.
   */
  bypassRef?: MutableRefObject<boolean>;
}) => {
  const { t } = useTranslation('content');
  const isProceedingRef = useRef(false);
  const [isProceeding, setIsProceeding] = useState(false);

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !bypassRef?.current &&
      isDirty &&
      nextLocation.pathname !== currentLocation.pathname,
  );

  useEffect(() => {
    /** Asks the browser to confirm closing/reloading while edits are unsaved. */
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty || bypassRef?.current) {
        return;
      }

      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty, bypassRef]);

  useEffect(() => {
    if (blocker.state === 'unblocked') {
      isProceedingRef.current = false;
      setIsProceeding(false);
    }
  }, [blocker.state]);

  /** Confirms the discard dialog and lets the blocked navigation continue. */
  const proceedWithoutSaving = () => {
    if (blocker.state !== 'blocked') {
      return;
    }

    isProceedingRef.current = true;
    setIsProceeding(true);
    blocker.proceed();
  };

  return {
    blocker,
    isProceeding,
    isProceedingRef,
    t,
    proceedWithoutSaving,
  };
};
