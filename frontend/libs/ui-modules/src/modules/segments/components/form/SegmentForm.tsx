import { Button, cn, Label, Separator, Spinner } from 'erxes-ui';
import { FormProvider } from 'react-hook-form';
import { useSegmentActions } from 'ui-modules/modules/segments/hooks/useSegmentActions';
import { useSegmentDetail } from 'ui-modules/modules/segments/hooks/useSegmentDetail';

import { SegmentFormFooter } from 'ui-modules/modules/segments/components/form/SegmentFormFooter';
import { SegmentMetadataForm } from 'ui-modules/modules/segments/components/form/SegmentMetadataForm';
import {
  SegmentProvider,
  useSegment,
} from 'ui-modules/modules/segments/context/SegmentProvider';
import { SegmentGroup } from './SegmentGroup';
import { SegmentGroups } from './SegmentGroups';
import { IconPlus } from '@tabler/icons-react';

type Props = {
  contentType: string;
  segmentId?: string;
  callback: (contentId: string) => void;
  isTemporary?: boolean;
};

const SegmentGroupsContent = () => {
  const { form } = useSegment();
  const conditionSegments = form.watch('conditionSegments');

  if (conditionSegments?.length) {
    return <SegmentGroups />;
  }

  return <SegmentGroup />;
};

const SegmentFormContent = ({
  callback,
  isTemporary,
}: {
  isTemporary?: boolean;
  callback?: (contentId: string) => void;
}) => {
  const { form } = useSegment();

  const { watch } = form;

  const { onAddSegmentGroup } = useSegmentActions({ callback });

  return (
    <FormProvider {...form}>
      <form id="segment-form" className="h-full min-h-0 flex flex-col">
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto w-full p-2">
          <SegmentMetadataForm isTemporary={isTemporary} />
          <div className="pb-4">
            <SegmentGroupsContent />
          </div>
          <Separator className="my-2" />
          <Button
            variant="outline"
            className={cn(
              'w-full font-mono uppercase font-semibold text-xs text-accent-foreground',
              {
                'pl-12': (watch('conditionSegments')?.length || 0) > 1,
              },
            )}
            onClick={onAddSegmentGroup}
          >
            <IconPlus />
            Add Group
          </Button>
        </div>
        <SegmentFormFooter callback={callback} />
      </form>
    </FormProvider>
  );
};

export function SegmentForm({
  contentType,
  isTemporary,
  callback,
  segmentId,
}: Props) {
  const { segment, segmentLoading } = useSegmentDetail(segmentId);

  if (segmentLoading) {
    return <Spinner />;
  }

  const updatedProps = {
    isTemporary,
    callback,
  };

  return (
    <SegmentProvider contentType={contentType} segment={segment}>
      <SegmentFormContent {...updatedProps} />
    </SegmentProvider>
  );
}
