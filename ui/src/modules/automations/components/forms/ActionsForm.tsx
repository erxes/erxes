import { __ } from 'modules/common/utils';
import React from 'react';
import { ActionBox } from 'modules/automations/styles';
import Icon from 'modules/common/components/Icon';
import { ACTIONS } from 'modules/automations/constants';
import { IAction } from 'modules/automations/types';

type Props = {
  onClickAction: (action: IAction) => void;
};

class ActionsForm extends React.Component<Props> {
  renderBox(action, index) {
    const { onClickAction } = this.props;

    return (
      <ActionBox key={index} onClick={onClickAction.bind(this, action)}>
        <Icon icon={action.icon} size={30} />
        <div>
          <b>{__(action.label)}</b>
          <p>{__(action.description)}</p>
        </div>
      </ActionBox>
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
