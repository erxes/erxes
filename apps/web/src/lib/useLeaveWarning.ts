import { useEffect } from 'react';

/** The pages open now with unsaved changes; closing their app tab asks first. */
const unsaved = new Set<symbol>();

/** Whether a page open now has unsaved changes. */
export const hasUnsavedChanges = () => unsaved.size > 0;

/**
 * While `dirty`, closing the page's app tab asks first; reloading or closing the browser tab
 * does too, unless the changes are `kept` in the browser and come back on their own.
 */
export const useLeaveWarning = (dirty: boolean, { kept = false } = {}) =>
  useEffect(() => {
    if (!dirty) return;

    const mark = Symbol('unsaved');
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();

    unsaved.add(mark);

    if (!kept) window.addEventListener('beforeunload', warn);

    return () => {
      unsaved.delete(mark);
      window.removeEventListener('beforeunload', warn);
    };
  }, [dirty, kept]);
