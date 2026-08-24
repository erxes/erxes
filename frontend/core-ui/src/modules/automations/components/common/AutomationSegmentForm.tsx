import {
  SegmentForm,
  SegmentFormMode,
  useFormValidationErrorHandler,
} from 'ui-modules';
import { useSegment } from 'ui-modules/modules/segments/context/SegmentProvider';
import { useSegmentActions } from 'ui-modules/modules/segments/hooks/useSegmentActions';
import { useAutomation } from '@/automations/context/AutomationProvider';
import { AutoamtionConfigFormFooter } from './AutomationConfigFormFooter';

export const AutomationSegmentForm = ({
  contentType,
  segmentId,
  callback,
  saveButtonLabel,
}: {
  contentType: string;
  segmentId?: string;
  callback: (contentId: string) => void;
  saveButtonLabel?: string;
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
            <SegmentForm.SegmentGroup />
          </div>
        </SegmentForm.Content>
        <div className="border-t bg-background">
          <AutomationSegmentFormFooter
            saveButtonLabel={saveButtonLabel}
            callback={callback}
          />
        </div>
      </SegmentForm.Wrapper>
    </SegmentForm.Root>
  );
};

const AutomationSegmentFormFooter = ({
  callback,
  saveButtonLabel,
}: {
  callback: (contentId: string) => void;
  saveButtonLabel?: string;
}) => {
  const { form } = useSegment();
  const { isReadOnly } = useAutomation();
  const { handleSave } = useSegmentActions({ callback });
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Trigger',
  });

  // Saving here writes the segment immediately, before and regardless of the
  // automation's own save, so it needs the same permission the automation does
  if (isReadOnly) {
    return null;
  }

  return (
    <AutoamtionConfigFormFooter
      label={saveButtonLabel}
      onSave={form.handleSubmit(handleSave, handleValidationErrors)}
    />
  );
};
