import { IButtonMutateProps } from 'modules/common/types';
import { Form } from 'modules/segments/components/common';
import {
  ISegment,
  ISegmentDoc,
  ISegmentField,
  ISegmentWithConditionDoc
} from 'modules/segments/types';
import * as React from 'react';

type Props = {
  fields: ISegmentField[];
  headSegments: ISegment[];
  count: (segment: ISegmentDoc) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  afterSave: () => void;
};

const SegmentsForm = (props: Props) => {
  const { fields, headSegments, count, afterSave, renderButton } = props;

  return (
    <Form
      fields={fields}
      headSegments={headSegments}
      count={count}
      afterSave={afterSave}
      renderButton={renderButton}
    />
  );
};

export default SegmentsForm;
