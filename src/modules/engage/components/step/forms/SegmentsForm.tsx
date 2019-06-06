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
  create: (params: { doc: ISegmentWithConditionDoc }) => void;
  headSegments: ISegment[];
  count: (segment: ISegmentDoc) => void;
  showForm: (value: boolean) => void;
};

const SegmentsForm = (props: Props) => {
  const toggleForm = () => {
    return props.showForm(false);
  };

  const { fields, create, headSegments, count } = props;

  return (
    <Form
      fields={fields}
      create={create}
      headSegments={headSegments}
      count={count}
      afterSave={toggleForm}
    />
  );
};

export default SegmentsForm;
