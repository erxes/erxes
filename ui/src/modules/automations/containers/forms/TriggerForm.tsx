import React from 'react';
import Form from '../../components/forms/TriggerForm';

type Props = {
  closeModal: () => void;
  addConfig: (value: string, contentId?: string, id?: string) => void;
};

const TriggerFormContainer = (props: Props) => {
  const extendedProps = {
    ...props
  };

  return <Form {...extendedProps} />;
};

export default TriggerFormContainer;
