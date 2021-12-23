import Icon from 'erxes-ui/lib/components/Icon';
import { IButtonMutateProps } from 'erxes-ui/lib/types';
import { __ } from 'erxes-ui/lib/utils';
import { TargetCount } from '../../types';
import React from 'react';
import Common from './Common';
import SegmentsForm from './forms/SegmentsForm';

type Props = {
  messageType: string;
  targetCount: TargetCount;
  segmentIds: string[];
  segments: any[];
  customersCount: (ids: string[]) => number;
  onChange: (name: string, value: string[]) => void;
  renderContent: ({
    actionSelector,
    selectedComponent,
    customerCounts
  }: {
    actionSelector: React.ReactNode;
    selectedComponent: React.ReactNode;
    customerCounts: React.ReactNode;
  }) => React.ReactNode;
  segmentType: string;
  afterSave: () => void;
};

const SegmentStep = (props: Props) => {
  const {
    onChange,
    segments,
    segmentIds,
    targetCount,
    customersCount,
    messageType,
    renderContent,
    segmentType,
    afterSave
  } = props;

  const formProps = {
    segmentType,
    afterSave
  };

  const orderedSegments: any[] = [];
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
    <Common<any, IButtonMutateProps>
      name="segmentIds"
      label={__('Create a segment')}
      targetIds={segmentIds}
      messageType={messageType}
      targets={orderedSegments}
      targetCount={targetCount}
      customersCount={customersCount}
      onChange={onChange}
      Form={SegmentsForm}
      content={renderContent}
      formProps={formProps}
      icons={icons}
    />
  );
};

export default SegmentStep;
