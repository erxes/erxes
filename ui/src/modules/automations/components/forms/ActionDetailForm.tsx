import { __ } from 'modules/common/utils';
import React from 'react';
import { IAction, ITrigger } from 'modules/automations/types';
import { ActionForms } from './actions';

type Props = {
  closeModal: () => void;
  addActionConfig: (value: any) => void;
  closeParentModal?: () => void;
  currentAction: {
    trigger: ITrigger;
    action: IAction;
  };
  addAction: (value: string, contentId?: string) => void;
};

class ActionDetailForm extends React.Component<Props> {
  onSave = () => {
    const {
      closeParentModal,
      closeModal,
      addAction,
      currentAction
    } = this.props;

    addAction(currentAction.action.type);

    closeParentModal ? closeParentModal() : closeModal();
  };

  render() {
    const { currentAction } = this.props;

    const Content =
      ActionForms[currentAction.action.type] || ActionForms.default;

    return (
      <Content
        action={currentAction.action}
        onSave={this.onSave}
        {...this.props}
      />
    );
  }
}

export default ActionDetailForm;
