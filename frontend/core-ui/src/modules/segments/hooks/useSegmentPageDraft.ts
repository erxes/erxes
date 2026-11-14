import { type MutableRefObject, useLayoutEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import type { TSegmentForm } from 'ui-modules';

/**
 * Carries unsaved segment values from the panel into its detail page: the
 * panel exposes its values through `draft`, and the page restores them once
 * and drops them from the history entry.
 */
export const useSegmentPageDraft = (
  draft: MutableRefObject<(() => TSegmentForm) | null>,
  initialDraft?: TSegmentForm,
) => {
  const { getValues, reset } = useFormContext<TSegmentForm>();
  const location = useLocation();
  const navigate = useNavigate();
  const state: { segmentDraft?: TSegmentForm } | null = location.state;
  const restored = useRef(false);

  useLayoutEffect(() => {
    draft.current = getValues;

    if (!restored.current && initialDraft) {
      restored.current = true;
      reset(initialDraft, { keepDefaultValues: true });

      const nextState = { ...state };
      delete nextState.segmentDraft;
      navigate(
        {
          pathname: location.pathname,
          search: location.search,
          hash: location.hash,
        },
        { replace: true, state: nextState },
      );
    }

    return () => {
      draft.current = null;
    };
  }, [draft, getValues, reset, initialDraft, location, navigate, state]);
};
