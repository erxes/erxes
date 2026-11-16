import { type RefObject, useEffect } from 'react';

// The first field a member types into; an upload, a box to tick or a hidden input is skipped.
const FIRST_FIELD =
  'input:not([type=hidden],[type=file],[type=checkbox],[type=radio],:disabled), textarea:not(:disabled)';

/** The first field to type into under `root`, if it has one. */
export const findFirstField = (root: Element | null | undefined) =>
  root?.querySelector<HTMLElement>(FIRST_FIELD) ?? null;

/**
 * Puts the cursor in the first field under `ref` when the form opens. For a page or panel whose
 * one job is that form; it doesn't scroll the field into view.
 */
export const useFocusFirstField = (ref: RefObject<HTMLElement | null>) => {
  useEffect(() => {
    findFirstField(ref.current)?.focus({ preventScroll: true });
  }, [ref]);
};
