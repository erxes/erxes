import { IAction } from 'modules/automations/types';
import React from 'react';

type Props = {
  closeModal: () => void;
  action: IAction;
};

export class PerformMathForm extends React.Component<Props> {
  render() {
    return <>Perform math current form {this.props.action.type} </>;
  }
}
