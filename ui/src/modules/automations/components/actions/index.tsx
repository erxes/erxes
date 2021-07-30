import { IAction } from 'modules/automations/types';
import React from 'react';
import { PerformMathForm } from './PerformMath';

type Props = {
  closeModal: () => void;
  action: IAction;
};

class DefaultForm extends React.Component<Props> {
  render() {
    return <div>content {this.props.action.type}</div>;
  }
}

export const ActionForms = {
  default: DefaultForm,
  performMath: PerformMathForm
};
