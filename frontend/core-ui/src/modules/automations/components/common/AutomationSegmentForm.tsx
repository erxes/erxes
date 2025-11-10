import { Button, Sheet } from 'erxes-ui';
import { SegmentForm } from 'ui-modules';
import { useSegment } from 'ui-modules/modules/segments/context/SegmentProvider';
import { useSegmentActions } from 'ui-modules/modules/segments/hooks/useSegmentActions';

export const AutomationSegmentForm = ({
  contentType,
  segmentId,
  callback,
}: {
  contentType: string;
  segmentId: string;
  callback: (contentId: string) => void;
}) => {
  return (
    <SegmentForm.Root contentType={contentType} segmentId={segmentId}>
      <SegmentForm.Wrapper>
        <SegmentForm.Content callback={callback} />
        <WaitEventConfigSegmentFormFooter callback={callback} />
      </SegmentForm.Wrapper>
    </SegmentForm.Root>
  );
};

const WaitEventConfigSegmentFormFooter = ({
  callback,
}: {
  callback: (contentId: string) => void;
}) => {
  const { form } = useSegment();
  const { handleSave } = useSegmentActions({ callback });

  return (
    <Sheet.Footer>
      <Button onClick={form.handleSubmit(handleSave)}>Save</Button>
    </Sheet.Footer>
  );
};
