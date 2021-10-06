import Form from 'modules/segments/containers/form/SegmentsForm';
import React from 'react';

type Props = {
  segmentType: string;
  afterSave: () => void;
};

const SegmentsForm = (props: Props) => {
  const { segmentType, afterSave } = props;

  return <Form contentType={segmentType} closeModal={afterSave} />;
};

export default SegmentsForm;
