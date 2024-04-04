import { IAction } from '@erxes/ui-automations/src/types';
import React from 'react';
import { ActionForms } from './';

type Props = {
  activeAction: IAction;
  triggerType: string;
  triggerConfig: any;
  addAction: (action: IAction, actionId?: string, config?: any) => void;
  closeModal: () => void;
  actionsConst: any[];
  propertyTypesConst: any[];
};

class ActionDetailForm extends React.Component<Props> {
  onSave = () => {
    const { addAction, activeAction, closeModal } = this.props;

    addAction(activeAction);

    closeModal();
  };

  render() {
    const { activeAction } = this.props;

    const { type } = activeAction;

    return <>{ActionForms({ onSave: this.onSave, ...this.props })[type]}</>;
  }
}

export default ActionDetailForm;
