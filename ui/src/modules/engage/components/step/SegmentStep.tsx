import Icon from 'modules/common/components/Icon';
import { IButtonMutateProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { TargetCount } from 'modules/engage/types';
import { ISegment } from 'modules/segments/types';
import React from 'react';
import Common from './Common';
import SegmentsForm from './forms/SegmentsForm';

type Props = {
  messageType: string;
  targetCount: TargetCount;
  segmentIds: string[];
  segments: ISegment[];
  headSegments: ISegment[];
  segmentFields: any[];
  customersCount: (ids: string[]) => number;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  onChange: (name: string, value: string[]) => void;
  renderContent: (
    {
      actionSelector,
      selectedComponent,
      customerCounts
    }: {
      actionSelector: React.ReactNode;
      selectedComponent: React.ReactNode;
      customerCounts: React.ReactNode;
    }
  ) => React.ReactNode;
};

const SegmentStep = (props: Props) => {
  const {
    renderButton,
    onChange,
    segments,
    segmentIds,
    targetCount,
    customersCount,
    messageType,
    renderContent,
    segmentFields,
    headSegments
  } = props;

  const formProps = {
    fields: segmentFields,
    headSegments
  };

  const orderedSegments: ISegment[] = [];
  const icons: React.ReactNode[] = [];

  segments.forEach(segment => {
    if (!segment.subOf) {
      orderedSegments.push(segment, ...segment.getSubSegments);
    }
  });

  orderedSegments.forEach(segment => {
    icons.push(
      <>
        {segment.subOf ? '\u00a0\u00a0\u00a0\u00a0\u00a0' : null}
        <Icon icon="chart-pie icon" style={{ color: segment.color }} />
      </>
    );
  });

  return (
    <Common<ISegment, IButtonMutateProps>
      name="segmentIds"
      label={__('Create a segment')}
      targetIds={segmentIds}
      messageType={messageType}
      targets={orderedSegments}
      targetCount={targetCount}
      customersCount={customersCount}
      onChange={onChange}
      renderButton={renderButton}
      Form={SegmentsForm}
      content={renderContent}
      formProps={formProps}
      icons={icons}
    />
  );
};

export default SegmentStep;
