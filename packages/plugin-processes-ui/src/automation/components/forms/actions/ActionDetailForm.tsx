import { IAction } from '../../../types';
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

    if (
      [
        'cards:deal.create',
        'cards:task.create',
        'cards:ticket.create'
      ].includes(type)
    ) {
      type = 'boardItem';
    }

    if ('loyalties:voucher.create' === type) {
      type = 'voucher';
    }

    if ('loyalties:scoreLog.create' === type) {
      type = 'changeScore';
    }

    const Content = ActionForms[type] || ActionForms.default;

    return <Content onSave={this.onSave} {...this.props} />;
  }
}

export default ActionDetailForm;
