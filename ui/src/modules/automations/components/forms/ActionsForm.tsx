import { __ } from 'modules/common/utils';
import React from 'react';
import { ActionBox } from 'modules/automations/styles';
import Icon from 'modules/common/components/Icon';
import { ACTIONS } from 'modules/automations/constants';
import { ITrigger } from 'modules/automations/types';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import ActionDetailForm from './ActionDetailForm';

type Props = {
  closeModal: () => void;
  addAction: (value: string) => void;
  addActionConfig: (config: any) => void;
  trigger?: ITrigger;
};

class ActionsForm extends React.Component<Props> {
  renderBox(action, index) {
    const { closeModal, addAction, addActionConfig } = this.props;
    const currentAction = { trigger: {} as ITrigger, action };

    const trigger = (
      <ActionBox key={index}>
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
        activeAction={action}
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
    return ACTIONS.map((action, index) => (
      <React.Fragment key={index}>
        {this.renderBox(action, index)}
      </React.Fragment>
    ));
  }
}

export default ActionsForm;
