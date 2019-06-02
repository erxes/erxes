import { __ } from 'modules/common/utils';
import { SegmentAdd, TargetCount } from 'modules/engage/types';
import { ISegment, ISegmentDoc, ISegmentField } from 'modules/segments/types';
import * as React from 'react';
import Common from './Common';
import { SegmentsForm } from './forms';

type Props = {
  messageType: string;
  targetCount: TargetCount;
  segmentIds: string[];
  segments: ISegment[];
  headSegments: ISegment[];
  segmentFields: ISegmentField[];
  customersCount: (ids: string[]) => number;
  segmentAdd: SegmentAdd;
  count: (segment: ISegmentDoc) => void;
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
    segmentAdd,
    onChange,
    segments,
    segmentIds,
    targetCount,
    customersCount,
    messageType,
    renderContent,
    segmentFields,
    headSegments,
    count
  } = props;

  const formProps = {
    fields: segmentFields,
    headSegments,
    count
  };

  const orderedSegments: ISegment[] = [];

  segments.forEach(segment => {
    if (!segment.subOf) {
      orderedSegments.push(segment, ...segment.getSubSegments);
    }
  });

  return (
    <Common<ISegment, SegmentAdd>
      name="segmentIds"
      label="Create a segment"
      targetIds={segmentIds}
      messageType={messageType}
      targets={orderedSegments}
      targetCount={targetCount}
      customersCount={customersCount}
      onChange={onChange}
      onSubmit={segmentAdd}
      Form={SegmentsForm}
      content={renderContent}
      formProps={formProps}
    />
  );
};

export default SegmentStep;
