import React from 'react';
import { IAction } from 'modules/automations/types';
import { ActionForms } from './actions';

type Props = {
  addActionConfig: (value: any) => void;
  closeParentModal?: () => void;
  activeAction: IAction;
  addAction: (value: string, contentId?: string, actionId?: string) => void;
};

class ActionDetailForm extends React.Component<Props> {
  onSave = () => {
    const { closeParentModal, addAction, activeAction } = this.props;

    addAction(activeAction.type);

    // tslint:disable-next-line:no-unused-expression
    closeParentModal && closeParentModal();
  };

  render() {
    const { activeAction } = this.props;

    let { type } = activeAction;

    if (['createDeal', 'createTask', 'createTicket'].includes(type)) {
      type = 'boardItem';
    }

    const Content = ActionForms[type] || ActionForms.default;

    return (
      <Content action={activeAction} onSave={this.onSave} {...this.props} />
    );
  }
}

export default ActionDetailForm;
