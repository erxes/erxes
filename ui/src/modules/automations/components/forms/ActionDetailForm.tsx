import React from 'react';
import { IAction } from 'modules/automations/types';
import { ActionForms } from './actions';

type Props = {
  closeModal: () => void;
  addActionConfig: (value: any) => void;
  closeParentModal?: () => void;
  activeAction: IAction;
  addAction: (value: string, contentId?: string, actionId?: string) => void;
};

class ActionDetailForm extends React.Component<Props> {
  onSave = () => {
    const {
      closeParentModal,
      closeModal,
      addAction,
      activeAction
    } = this.props;

    addAction(activeAction.type);

    closeParentModal ? closeParentModal() : closeModal();
  };

  render() {
    const { activeAction } = this.props;

    let { type } = activeAction;

    if (['createDeal', 'createTask', 'createTicket'].includes(type)) {
      type = 'boardItem';
    }

    const Content = ActionForms[type] || ActionForms.default;

    console.log('sdadas', Content);

    return (
      <Content action={activeAction} onSave={this.onSave} {...this.props} />
    );
  }
}

export default ActionDetailForm;
