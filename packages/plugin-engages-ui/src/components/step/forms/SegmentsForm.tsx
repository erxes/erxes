import Form from '@erxes/ui-segments/src/containers/form/SegmentsForm';
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
