import { useEffect, useRef } from 'react';
import { useFormValidationErrorHandler } from 'ui-modules';
import { useSegment } from 'ui-modules/modules/segments/context/SegmentProvider';
import { useSegmentActions } from 'ui-modules/modules/segments/hooks/useSegmentActions';

/**
 * Saving a split's condition segment, and telling the caller whether there is
 * something unsaved: a new condition always is, an existing one once edited.
 */
export const useSplitConditionFormFooter = ({
  segmentId,
  callback,
  onDirtyChange,
}: {
  segmentId?: string;
  callback: (contentId: string) => void;
  onDirtyChange?: (isDirty: boolean) => void;
}) => {
  const { form } = useSegment();
  const { handleSave } = useSegmentActions({ callback });
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Split condition',
  });
  const {
    formState: { isDirty, isSubmitting },
  } = form;
  const onDirtyChangeRef = useRef(onDirtyChange);
  const shouldSave = isDirty || !segmentId;

  useEffect(() => {
    onDirtyChangeRef.current = onDirtyChange;
  });

  useEffect(() => {
    onDirtyChangeRef.current?.(shouldSave);
  }, [shouldSave]);

  useEffect(() => () => onDirtyChangeRef.current?.(false), []);

  return {
    shouldSave,
    unsavedKey: segmentId
      ? 'split-condition-unsaved-changes'
      : 'split-condition-not-saved',
    saveDisabled: !shouldSave || isSubmitting,
    onSave: form.handleSubmit(handleSave, handleValidationErrors),
  };
};
