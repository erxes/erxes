import { __ } from 'modules/common/utils';
import React from 'react';
import { TriggerBox } from '../../styles';
import Icon from 'modules/common/components/Icon';
import { FlexRow } from 'modules/settings/styles';
import { TRIGGERS } from 'modules/automations/constants';
import { ITrigger } from 'modules/automations/types';

type Props = {
  onClickTrigger: (trigger: ITrigger) => void;
  mainType: string;
  addConfig: (mainType: string, value: string, contentId?: string) => void;
};

type State = {
  mainType: string;
};

class TriggerForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      mainType: props.mainType || ''
    };
  }

  renderBox(trigger, index) {
    const { onClickTrigger } = this.props;

    return (
      <TriggerBox key={index} onClick={onClickTrigger.bind(this, trigger)}>
        <Icon icon={trigger.icon} size={30} />
        {__(trigger.label)}
      </TriggerBox>
    );
  }

  render() {
    return (
      <FlexRow>
        {TRIGGERS.map((action, index) => (
          <React.Fragment key={index}>
            {this.renderBox(action, index)}
          </React.Fragment>
        ))}
      </FlexRow>
    );
  }
}

export default TriggerForm;
