import { SegmentForm } from 'ui-modules';
import { useSegment } from 'ui-modules/modules/segments/context/SegmentProvider';
import { useSegmentActions } from 'ui-modules/modules/segments/hooks/useSegmentActions';
import { AutoamtionConfigFormFooter } from './AutomationConfigFormFooter';

export const AutomationSegmentForm = ({
  contentType,
  segmentId,
  callback,
}: {
  contentType: string;
  segmentId?: string;
  callback: (contentId: string) => void;
}) => {
  return (
    <SegmentForm.Root contentType={contentType} segmentId={segmentId}>
      <SegmentForm.Wrapper>
        <SegmentForm.Content callback={callback} />
        <div className="border-t bg-background">
          <AutomationSegmentFormFooter callback={callback} />
        </div>
      </SegmentForm.Wrapper>
    </SegmentForm.Root>
  );
};

const AutomationSegmentFormFooter = ({
  callback,
}: {
  callback: (contentId: string) => void;
}) => {
  const { form } = useSegment();
  const { handleSave } = useSegmentActions({ callback });

  return <AutoamtionConfigFormFooter onSave={form.handleSubmit(handleSave)} />;
};
