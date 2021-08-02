import React from 'react';
import { IAction } from 'modules/automations/types';
import { ActionForms } from './actions';

type Props = {
  closeModal: () => void;
  addActionConfig: (value: any) => void;
  closeParentModal?: () => void;
  activeAction: IAction;
  addAction: (value: string, contentId?: string) => void;
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

    const Content = ActionForms[activeAction.type] || ActionForms.default;

    return (
      <Content action={activeAction} onSave={this.onSave} {...this.props} />
    );
  }
}

export default ActionDetailForm;
