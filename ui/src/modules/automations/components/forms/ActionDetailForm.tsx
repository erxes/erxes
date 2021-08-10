import React from 'react';
import { IAction } from 'modules/automations/types';
import { ActionForms } from './actions';

type Props = {
  addActionConfig: (value: any) => void;
  activeAction: IAction;
  addAction: (value: string, contentId?: string, actionId?: string) => void;
};

class ActionDetailForm extends React.Component<Props> {
  onSave = () => {
    const { addAction, activeAction } = this.props;

    addAction(activeAction.type);
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
