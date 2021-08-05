import { __ } from 'modules/common/utils';
import React from 'react';
import { TriggerBox } from '../../styles';
import Icon from 'modules/common/components/Icon';
import { FlexRow } from 'modules/settings/styles';
import TriggerDetailForm from './TriggerDetailForm';
import ModalTrigger from 'modules/common/components/ModalTrigger';

type Props = {
  closeModal: () => void;
  addTrigger: (value: string) => void;
};

class TriggerForm extends React.Component<Props> {
  renderBox(key: string, icon: string, text: string) {
    const { closeModal, addTrigger } = this.props;

    const trigger = (
      <TriggerBox>
        <Icon icon={icon} size={30} />
        {__(text)}
      </TriggerBox>
    );

    const content = props => (
      <TriggerDetailForm
        closeParentModal={closeModal}
        activeTrigger={{
          type: key
        }}
        addTrigger={addTrigger}
        {...props}
      />
    );

    return (
      <ModalTrigger
        title={`${text} options`}
        trigger={trigger}
        content={content}
        size="lg"
      />
    );
  }

  render() {
    return (
      <FlexRow>
        {this.renderBox('formSubmit', 'file-plus-alt', 'Form Submit')}
        {this.renderBox('dealCreate', 'file-plus', 'Deal create')}
        {this.renderBox('deal', 'file-plus', 'Deal')}
        {this.renderBox('ticket', 'file-plus', 'Ticket')}
      </FlexRow>
    );
  }
}

export default TriggerForm;
