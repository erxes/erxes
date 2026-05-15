import { IconAlertCircle, IconCircleCheck } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useEffect, useRef } from 'react';
import {
  SegmentForm,
  SegmentFormMode,
  useFormValidationErrorHandler,
} from 'ui-modules';
import { useSegment } from 'ui-modules/modules/segments/context/SegmentProvider';
import { useSegmentActions } from 'ui-modules/modules/segments/hooks/useSegmentActions';

export const SplitConditionForm = ({
  contentType,
  segmentId,
  callback,
  onDirtyChange,
}: {
  contentType: string;
  segmentId?: string;
  callback: (contentId: string) => void;
  onDirtyChange?: (isDirty: boolean) => void;
}) => {
  return (
    <SegmentForm.Root
      contentType={contentType}
      segmentId={segmentId}
      mode={SegmentFormMode.SINGLE}
    >
      <SegmentForm.Wrapper>
        <SegmentForm.Content callback={callback}>
          <div className="mt-2">
            <SegmentForm.SegmentGroup withoutAssociationTypes />
          </div>
        </SegmentForm.Content>
        <div>
          <SplitConditionFormFooter
            segmentId={segmentId}
            callback={callback}
            onDirtyChange={onDirtyChange}
          />
        </div>
      </SegmentForm.Wrapper>
    </SegmentForm.Root>
  );
};

const SplitConditionFormFooter = ({
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
  const shouldSaveCondition = isDirty || !segmentId;

  useEffect(() => {
    onDirtyChangeRef.current = onDirtyChange;
  });

  useEffect(() => {
    onDirtyChangeRef.current?.(shouldSaveCondition);
  }, [shouldSaveCondition]);

  useEffect(() => {
    return () => onDirtyChangeRef.current?.(false);
  }, []);

  return (
    <div className="flex items-center justify-between gap-3 border-t bg-background p-2">
      <div className="flex min-w-0 items-center gap-2 text-xs">
        {shouldSaveCondition ? (
          <>
            <IconAlertCircle className="size-4 shrink-0 text-warning" />
            <span className="font-medium text-warning">
              {segmentId
                ? 'Unsaved condition changes'
                : 'Condition is not saved'}
            </span>
          </>
        ) : (
          <>
            <IconCircleCheck className="size-4 shrink-0 text-success" />
            <span className="text-muted-foreground">Condition saved</span>
          </>
        )}
      </div>
      <Button
        disabled={!shouldSaveCondition || isSubmitting}
        variant={shouldSaveCondition ? 'default' : 'secondary'}
        onClick={form.handleSubmit(handleSave, handleValidationErrors)}
      >
        {shouldSaveCondition ? 'Save condition' : 'Saved'}
      </Button>
    </div>
  );
};
