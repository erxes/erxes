import { IAction } from '@erxes/ui-automations/src/types';
import React from 'react';
import { ActionForms } from './';

type Props = {
  activeAction: IAction;
  triggerType: string;
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

    let { type } = activeAction;
    if ('loyalties:voucher.create' === type) {
      type = 'voucher';
    }

    if ('loyalties:scoreLog.create' === type) {
      type = 'changeScore';
    }

    return <>{ActionForms({ onSave: this.onSave, ...this.props })[type]}</>;
  }
}

export default ActionDetailForm;
