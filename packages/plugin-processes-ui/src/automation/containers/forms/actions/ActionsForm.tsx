import React from 'react';
import { IJob } from '../../../../flow/types';
import Form from '../../../components/forms/actions/ActionsForm';
import { IAction } from '../../../types';

type Props = {
  onClickAction: (action: IJob) => void;
};

const ActionsFormContainer = (props: Props) => {
  console.log('actionsForm start');

  const extendedProps = {
    ...props
  };
  console.log('actionsForm on container');
  return <Form {...extendedProps} />;
};

export default ActionsFormContainer;
