import { __ } from 'modules/common/utils';
import { TargetCount } from 'modules/engage/types';
import { ISegment, ISegmentDoc, ISegmentField } from 'modules/segments/types';
import * as React from 'react';
import { SegmentsForm } from '../forms';
import Common from './Common';

type Props = {
  messageType: string;
  targetCount: TargetCount;
  segmentIds: string[];
  segments: ISegment[];
  headSegments: ISegment[];
  segmentFields: ISegmentField[];
  customersCount: (ids: string[]) => number;
  segmentAdd: (params: { doc: ISegmentDoc }) => void;
  count: (segment: ISegmentDoc) => void;
  onChange: (
    name: 'brandIds' | 'tagIds' | 'segmentIds',
    value: string[]
  ) => void;
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

  return (
    <Common
      name="segmentIds"
      label="Create a segment"
      targetIds={segmentIds}
      messageType={messageType}
      targets={segments}
      targetCount={targetCount}
      customersCount={customersCount}
      onChange={onChange}
      save={segmentAdd}
      Form={SegmentsForm}
      content={renderContent}
      formProps={formProps}
    />
  );
};

export default SegmentStep;
