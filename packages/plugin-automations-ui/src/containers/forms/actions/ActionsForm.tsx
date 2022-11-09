import React from 'react';
import Form from '../../../components/forms/actions/ActionsForm';
import { IAction } from '@erxes/ui-automations/src/types';

type Props = {
  onClickAction: (action: IAction) => void;
  actionsConst: any[];
};

const ActionsFormContainer = (props: Props) => {
  const extendedProps = {
    ...props
  };

  return <Form {...extendedProps} />;
};

export default ActionsFormContainer;
