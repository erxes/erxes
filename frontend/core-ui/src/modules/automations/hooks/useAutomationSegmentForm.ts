import { useAutomation } from '@/automations/context/AutomationProvider';
import { useCallback, useState } from 'react';
import { useFormValidationErrorHandler } from 'ui-modules';
import { useSegment } from 'ui-modules/modules/segments/context/SegmentProvider';
import { useSegmentActions } from 'ui-modules/modules/segments/hooks/useSegmentActions';

/** Picking a listed segment instead; a pick applies and closes the popover. */
export const useUseExistingSegment = (
  onSelect: (contentId: string) => void,
) => {
  const [open, setOpen] = useState(false);

  const select = useCallback(
    (id: string | string[] | null) => {
      if (typeof id === 'string' && id) {
        onSelect(id);
        setOpen(false);
      }
    },
    [onSelect],
  );

  return { open, setOpen, select };
};

/**
 * Saving here writes the segment immediately, before and regardless of the
 * automation's own save, so it needs the same permission the automation does.
 */
export const useAutomationSegmentFormFooter = (
  callback: (contentId: string) => void,
) => {
  const { form } = useSegment();
  const { isReadOnly } = useAutomation();
  const { handleSave, saving } = useSegmentActions({ callback });
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Trigger',
  });

  return {
    canSave: !isReadOnly,
    saving,
    onSave: form.handleSubmit(handleSave, handleValidationErrors),
  };
};

/**
 * Keeping the automation's own conditions as a named, listed segment. Closing
 * the dialog without saving drops the typed name.
 */
export const useKeepAsSegment = (callback: (contentId: string) => void) => {
  const { form, ownedBy } = useSegment();
  const [open, setOpen] = useState(false);

  const { handleSave, saving } = useSegmentActions({
    callback: (contentId) => {
      callback(contentId);
      setOpen(false);
    },
  });
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Segment',
  });

  const onOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next);

      if (!next) {
        form.setValue('name', '', { shouldDirty: false });
      }
    },
    [form],
  );

  return {
    canKeep: !!ownedBy,
    open,
    onOpenChange,
    saving,
    onSave: form.handleSubmit(handleSave, handleValidationErrors),
  };
};
