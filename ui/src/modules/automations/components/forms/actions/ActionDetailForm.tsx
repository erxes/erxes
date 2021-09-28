import { IAction } from 'modules/automations/types';
import React from 'react';
import { ActionForms } from './';

type Props = {
  activeAction: IAction;
  triggerType: string;
  addAction: (action: IAction, actionId?: string, config?: any) => void;
  closeModal: () => void;
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

    if (['createDeal', 'createTask', 'createTicket'].includes(type)) {
      type = 'boardItem';
    }

    const Content = ActionForms[type] || ActionForms.default;

    return <Content onSave={this.onSave} {...this.props} />;
  }
}

export default ActionDetailForm;
