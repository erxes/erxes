import { type MutableRefObject, useLayoutEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import type { TSegmentForm } from 'ui-modules';

/** Carries unsaved segment values from the panel into its detail page. */
export const SegmentPageDraft = ({
  draft,
  initialDraft,
}: {
  draft: MutableRefObject<(() => TSegmentForm) | null>;
  initialDraft?: TSegmentForm;
}) => {
  const { getValues, reset } = useFormContext<TSegmentForm>();
  const restored = useRef(false);
  useLayoutEffect(() => {
    draft.current = getValues;
    if (!restored.current && initialDraft) {
      restored.current = true;
      reset(initialDraft, { keepDefaultValues: true });
    }
    return () => {
      draft.current = null;
    };
  }, [draft, getValues, reset, initialDraft]);
  return null;
};
