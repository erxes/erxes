import { Button, cn, Separator } from 'erxes-ui';
import React, { Children, isValidElement } from 'react';
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
import { useTranslation } from 'react-i18next';

function hasSegmentMetadataForm(children: React.ReactNode): boolean {
  let found = false;

  Children.forEach(children, (child) => {
    if (found) return;

    if (isValidElement(child)) {
      if (
        child.type === SegmentFormHeader ||
        (child.type as any)?.displayName === 'SegmentFormHeader'
      ) {
        found = true;
        return;
      }

      if (child.props?.children) {
        found = hasSegmentMetadataForm(child.props.children);
      }
    }
  });

  return found;
}

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
  const hasMetadataForm = hasSegmentMetadataForm(children);

  if (segmentLoading) {
    return <SegmentFormLoading />;
  }

  return (
    <SegmentProvider
      contentType={contentType}
      segment={segment}
      hasMetadataForm={hasMetadataForm}
    >
      {children}
    </SegmentProvider>
  );
};

const SegmentFormWrapper = ({ children }: { children: React.ReactNode }) => {
  const { form } = useSegment();

  return (
    <FormProvider {...form}>
      <form id="segment-form" className="h-full min-h-0 flex flex-col p-2">
        {children}
      </form>
    </FormProvider>
  );
};

const SegmentFormHeader = () => {
  return (
    <div className="w-full p-2 pb-0">
      <SegmentMetadataForm />
    </div>
  );
};

SegmentFormHeader.displayName = 'SegmentFormHeader';

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
  const { t } = useTranslation('segment', { keyPrefix: 'detail' });

  const { onAddSegmentGroup } = useSegmentActions({ callback });

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto w-full p-2 pt-0">
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
        {t('add-group')}
      </Button>
    </div>
  );
};

// Legacy props interface for backward compatibility
type LegacyProps = {
  contentType: string;
  segmentId?: string;
  callback: (contentId: string) => void;
  saveButtonText?: string;
};

// Legacy component wrapper
const SegmentFormLegacy = ({
  contentType,
  callback,
  segmentId,
}: LegacyProps) => {
  return (
    <SegmentFormRoot contentType={contentType} segmentId={segmentId}>
      <SegmentFormWrapper>
        <SegmentFormHeader />
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
