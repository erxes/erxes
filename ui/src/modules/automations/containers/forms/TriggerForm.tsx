import React from 'react';
import Form from '../../components/forms/TriggerForm';
import { ITrigger } from 'modules/automations/types';

type Props = {
  onClickTrigger: (trigger: ITrigger) => void;
  mainType: string;
  addTrigger: (mainType: string, value: string) => void;
};

const TriggerFormContainer = (props: Props) => {
  const extendedProps = {
    ...props
  };

  return <Form {...extendedProps} />;
};

export default TriggerFormContainer;
