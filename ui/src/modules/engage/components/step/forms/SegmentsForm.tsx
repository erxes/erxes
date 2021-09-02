import { IButtonMutateProps } from 'modules/common/types';
import Form from 'modules/segments/components/common/Form';
import { ISegment } from 'modules/segments/types';
import React from 'react';

type Props = {
  fields: any[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  headSegments: ISegment[];
  segments: ISegment[];
  afterSave: () => void;
};

const SegmentsForm = (props: Props) => {
  const { fields, renderButton, headSegments, afterSave, segments } = props;

  return (
    <Form
      fields={fields}
      events={[]}
      renderButton={renderButton}
      headSegments={headSegments}
      segments={segments}
      afterSave={afterSave}
    />
  );
};

export default SegmentsForm;
