import { __ } from 'modules/common/utils';
import React from 'react';
import { ActionBox } from 'modules/automations/styles';
import Icon from 'modules/common/components/Icon';
import { ACTIONS } from 'modules/automations/constants';
import { ITrigger } from 'modules/automations/types';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import ActionDetailForm from 'modules/automations/containers/forms/ActionDetailForm';

type Props = {
  closeModal: () => void;
  addAction: (value: string) => void;
  addActionConfig: (config: any) => void;
  trigger?: ITrigger;
};

class ActionsForm extends React.Component<Props> {
  onClickAction = action => {
    const { addAction, closeModal } = this.props;

    addAction(action.value);
    closeModal();
  };

  renderBox(action, index) {
    const { closeModal, addAction, addActionConfig } = this.props;
    const currentAction = { trigger: {} as ITrigger, action };

    const trigger = (
      <ActionBox key={index} onClick={this.onClickAction.bind(this, action)}>
        <Icon icon={action.icon} size={30} />
        <div>
          <b>{__(action.label)}</b>
          <p>{__(action.description)}</p>
        </div>
      </ActionBox>
    );

    const content = props => (
      <ActionDetailForm
        closeParentModal={closeModal}
        activeAction={action.value}
        currentAction={currentAction}
        addAction={addAction}
        addActionConfig={addActionConfig}
        {...props}
      />
    );

    return (
      <ModalTrigger
        title={`${action.label} options`}
        trigger={trigger}
        content={content}
        size="lg"
      />
    );
  }

  render() {
    return <>{ACTIONS.map((action, index) => this.renderBox(action, index))}</>;
  }
}

export default ActionsForm;
