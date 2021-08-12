import React from 'react';
import { IAction } from 'modules/automations/types';
import { ActionForms } from './actions';

type Props = {
  closeModal: () => void;
  activeAction: IAction;
  addAction: (action: IAction, contentId?: string, actionId?: string) => void;
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
