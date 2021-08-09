import React from 'react';
import Form from '../../components/forms/TriggerForm';
import { ITrigger } from 'modules/automations/types';

type Props = {
  onClickTrigger: (trigger: ITrigger) => void;
  // addTrigger: (mainType: string, value: string) => void;
  // closeModal: () => void;
  addConfig: (value: string, contentId?: string, id?: string) => void;
};

const TriggerFormContainer = (props: Props) => {
  const extendedProps = {
    ...props
  };

  return <Form {...extendedProps} />;
};

export default TriggerFormContainer;
