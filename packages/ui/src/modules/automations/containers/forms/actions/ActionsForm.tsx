import React from 'react';
import Form from '../../../components/forms/actions/ActionsForm';
import { IAction } from 'modules/automations/types';

type Props = {
  onClickAction: (action: IAction) => void;
};

const ActionsFormContainer = (props: Props) => {
  const extendedProps = {
    ...props
  };

  return <Form {...extendedProps} />;
};

export default ActionsFormContainer;
