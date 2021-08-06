import React from 'react';
import Form from '../../components/forms/ChooseType';

type Props = {
  closeModal: () => void;
};

const ChooseType = (props: Props) => {
  const extendedProps = {
    ...props
  };

  return <Form {...extendedProps} />;
};

export default ChooseType;
