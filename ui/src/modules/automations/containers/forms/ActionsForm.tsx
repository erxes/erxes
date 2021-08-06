import React from 'react';
import Form from '../../components/forms/ActionsForm';
import { IAction } from 'modules/automations/types';

type Props = {
  onClickAction: (action: IAction) => void;
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
