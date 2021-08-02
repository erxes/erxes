import React from 'react';
import Form from '../../components/forms/ActionsForm';

type Props = {
  closeModal: () => void;
  addAction: (value: string) => void;
  addActionConfig: (config: any) => void;
};

const ActionsFormContainer = (props: Props) => {
  const extendedProps = {
    ...props
  };

  return <Form {...extendedProps} />;
};

export default ActionsFormContainer;
