import { __ } from 'modules/common/utils';
import React from 'react';
import { ActionBox } from 'modules/automations/styles';
import Icon from 'modules/common/components/Icon';
import { ACTIONS } from 'modules/automations/constants';

type Props = {
  closeModal: () => void;
  addAction: (value: string) => void;
};

class ActionsForm extends React.Component<Props> {
  onClickAction = action => {
    const { addAction, closeModal } = this.props;

    addAction(action.label);
    closeModal();
  };

  renderBox(action, index) {
    return (
      <ActionBox key={index} onClick={this.onClickAction.bind(this, action)}>
        <Icon icon={action.icon} size={30} />
        <div>
          <b>{__(action.label)}</b>
          <p>{__(action.description)}</p>
        </div>
      </ActionBox>
    );
  }

  render() {
    return <>{ACTIONS.map((action, index) => this.renderBox(action, index))}</>;
  }
}

export default ActionsForm;
