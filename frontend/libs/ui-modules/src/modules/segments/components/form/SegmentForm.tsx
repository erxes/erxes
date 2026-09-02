import { useIsMobile } from 'erxes-ui';
import { FormProvider } from 'react-hook-form';
import { SegmentProvider, useSegment } from '../../context/SegmentProvider';
import { useSegmentDetail } from '../../hooks/useSegmentDetail';
import { SegmentFormFooter } from './SegmentFormFooter';
import { SegmentFormLoading } from './SegmentFormLoading';
import { SegmentFormUnavailable } from './SegmentFormUnavailable';
import { SegmentConditionHeader } from './SegmentConditionHeader';
import { SegmentGroup } from './SegmentGroup';
import { SegmentTreeSteps } from './SegmentTreeSteps';
import { SegmentMetadataForm } from './SegmentMetadataForm';

type RootProps = {
  contentType: string;
  segmentId?: string;
  children: React.ReactNode;
};

const SegmentFormRoot = ({ contentType, segmentId, children }: RootProps) => {
  const { segment, segmentLoading, unavailable } = useSegmentDetail(segmentId);

  if (segmentLoading) {
    return <SegmentFormLoading />;
  }

  if (unavailable) {
    return <SegmentFormUnavailable />;
  }

  return (
    <SegmentProvider
      key={`${contentType}:${segment?._id ?? 'new'}:${segment?.revision ?? 0}`}
      contentType={contentType}
      segment={segment}
    >
      {children}
    </SegmentProvider>
  );
};

const SegmentFormWrapper = ({ children }: { children: React.ReactNode }) => {
  const { form } = useSegment();

  return (
    <FormProvider {...form}>
      <form id="segment-form" className="h-full min-h-0 flex flex-col">
        {children}
      </form>
    </FormProvider>
  );
};

const SegmentFormHeader = () => (
  <div className="w-full p-2 pb-0">
    <SegmentMetadataForm />
  </div>
);

SegmentFormHeader.displayName = 'SegmentFormHeader';

const SegmentFormContent = ({ children }: { children?: React.ReactNode }) => {
  const stepped = useIsMobile();

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto w-full p-2 pt-0">
      {children ??
        (stepped ? (
          <SegmentTreeSteps />
        ) : (
          <div className="pt-4 overflow-x-auto">
            <div className="min-w-[640px]">
              <SegmentConditionHeader />
              <SegmentGroup path="root" />
            </div>
          </div>
        ))}
    </div>
  );
};

type SegmentFormProps = {
  contentType: string;
  segmentId?: string;
  callback?: (id: string) => void;
  onCreateSuccess?: (id: string) => void;
  onOpenExisting?: (segmentId: string) => void;
};

const SegmentFormDefault = ({
  contentType,
  segmentId,
  callback,
  onCreateSuccess,
  onOpenExisting,
}: SegmentFormProps) => (
  <SegmentFormRoot contentType={contentType} segmentId={segmentId}>
    <SegmentFormWrapper>
      <SegmentFormHeader />
      <SegmentFormContent />
      <SegmentFormFooter
        callback={callback}
        onCreateSuccess={onCreateSuccess}
        onOpenExisting={onOpenExisting}
      />
    </SegmentFormWrapper>
  </SegmentFormRoot>
);

export const SegmentForm = Object.assign(SegmentFormDefault, {
  Root: SegmentFormRoot,
  Wrapper: SegmentFormWrapper,
  Header: SegmentFormHeader,
  Content: SegmentFormContent,
  Group: SegmentGroup,
  Footer: SegmentFormFooter,
});
