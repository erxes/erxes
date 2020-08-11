import { IButtonMutateProps } from 'modules/common/types';
import Form from 'modules/segments/components/common/Form';
import { ISegment } from 'modules/segments/types';
import React from 'react';

type Props = {
  fields: any[];
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  headSegments: ISegment[];
  afterSave: () => void;
};

const SegmentsForm = (props: Props) => {
  const { fields, renderButton, headSegments, afterSave } = props;

  return (
    <Form
      fields={fields}
      events={[]}
      renderButton={renderButton}
      headSegments={headSegments}
      afterSave={afterSave}
    />
  );
};

export default SegmentsForm;
