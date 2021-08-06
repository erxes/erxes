import { __ } from 'modules/common/utils';
import React from 'react';
import { TriggerBox } from '../../styles';
import Icon from 'modules/common/components/Icon';
import { FlexRow } from 'modules/settings/styles';
import TriggerDetailForm from './TriggerDetailForm';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { TRIGGERS } from 'modules/automations/constants';

type Props = {
  closeModal: () => void;
  addConfig: (value: string, contentId?: string, id?: string) => void;
};

class TriggerForm extends React.Component<Props> {
  renderBox(trigger, index) {
    const { closeModal, addConfig } = this.props;

    const triggerBox = (
      <TriggerBox key={index}>
        <Icon icon={trigger.icon} size={30} />
        {__(trigger.label)}
      </TriggerBox>
    );

    const content = props => (
      <TriggerDetailForm
        closeParentModal={closeModal}
        activeTrigger={{
          type: trigger.type
        }}
        addConfig={addConfig}
        {...props}
      />
    );

    return (
      <ModalTrigger
        title={`${trigger.label} options`}
        trigger={triggerBox}
        content={content}
        size="lg"
      />
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
