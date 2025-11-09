import { Button, cn, Separator } from 'erxes-ui';
import React from 'react';
import { FormProvider, useWatch } from 'react-hook-form';
import { useSegmentActions } from 'ui-modules/modules/segments/hooks/useSegmentActions';
import { useSegmentDetail } from 'ui-modules/modules/segments/hooks/useSegmentDetail';

import { IconPlus } from '@tabler/icons-react';
import { SegmentFormFooter } from 'ui-modules/modules/segments/components/form/SegmentFormFooter';
import { SegmentFormLoading } from 'ui-modules/modules/segments/components/form/SegmentFormLoading';
import { SegmentMetadataForm } from 'ui-modules/modules/segments/components/form/SegmentMetadataForm';
import {
  SegmentProvider,
  useSegment,
} from 'ui-modules/modules/segments/context/SegmentProvider';
import { SegmentGroups } from './SegmentGroups';
import { SegmentConfigWidget } from './SegmentConfigWidget';

type SegmentFormRootProps = {
  contentType: string;
  segmentId?: string;
  children: React.ReactNode;
};

const SegmentFormRoot = ({
  contentType,
  segmentId,
  children,
}: SegmentFormRootProps) => {
  const { segment, segmentLoading } = useSegmentDetail(segmentId);

  if (segmentLoading) {
    return <SegmentFormLoading />;
  }

  return (
    <SegmentProvider contentType={contentType} segment={segment}>
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

const SegmentFormHeader = ({ isTemporary }: { isTemporary?: boolean }) => {
  if (isTemporary) {
    return null;
  }
  return (
    <div className="w-full p-2 pb-4">
      <SegmentMetadataForm />
    </div>
  );
};

const SegmentFormContent = ({
  callback,
}: {
  callback?: (contentId: string) => void;
}) => {
  const { form, contentType } = useSegment();

  const conditionSegments = useWatch({
    control: form.control,
    name: 'conditionSegments',
  });

  const { onAddSegmentGroup } = useSegmentActions({ callback });

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto w-full p-2">
      <SegmentConfigWidget contentType={contentType} />
      <div className="pb-4">
        <SegmentGroups />
      </div>
      <Separator className="my-2" />
      <Button
        variant="secondary"
        className={cn(
          'w-full font-mono uppercase font-semibold text-xs text-accent-foreground',
          {
            'pl-12': (conditionSegments?.length || 0) > 1,
          },
        )}
        onClick={onAddSegmentGroup}
      >
        <IconPlus />
        Add Group
      </Button>
    </div>
  );
};

// Legacy props interface for backward compatibility
type LegacyProps = {
  contentType: string;
  segmentId?: string;
  callback: (contentId: string) => void;
  isTemporary?: boolean;
  saveButtonText?: string;
};

// Legacy component wrapper
const SegmentFormLegacy = ({
  contentType,
  isTemporary,
  callback,
  segmentId,
}: LegacyProps) => {
  return (
    <SegmentFormRoot contentType={contentType} segmentId={segmentId}>
      <SegmentFormWrapper>
        <SegmentFormHeader isTemporary={isTemporary} />
        <SegmentFormContent callback={callback} />
        <SegmentFormFooter callback={callback} />
      </SegmentFormWrapper>
    </SegmentFormRoot>
  );
};

export const SegmentForm = Object.assign(SegmentFormLegacy, {
  Root: SegmentFormRoot,
  Wrapper: SegmentFormWrapper,
  Header: SegmentFormHeader,
  Content: SegmentFormContent,
  Footer: SegmentFormFooter,
});
