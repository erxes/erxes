import React from 'react';
import Form from '../../components/forms/TriggerForm';

type Props = {
  closeModal: () => void;
  addTrigger: (value: string) => void;
};

const TriggerFormContainer = (props: Props) => {
  const extendedProps = {
    ...props
  };

  return <Form {...extendedProps} />;
};

export default TriggerFormContainer;
