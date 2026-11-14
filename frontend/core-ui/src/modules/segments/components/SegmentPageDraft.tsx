import { useSegmentPageDraft } from '@/segments/hooks/useSegmentPageDraft';
import { type MutableRefObject } from 'react';
import type { TSegmentForm } from 'ui-modules';

/** Carries unsaved segment values from the panel into its detail page. */
export const SegmentPageDraft = ({
  draft,
  initialDraft,
}: {
  draft: MutableRefObject<(() => TSegmentForm) | null>;
  initialDraft?: TSegmentForm;
}) => {
  useSegmentPageDraft(draft, initialDraft);

  return null;
};
