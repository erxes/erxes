import { __ } from 'modules/common/utils';
import React from 'react';
import jquery from 'jquery';
import { TriggerBox } from '../../styles';
import Icon from 'modules/common/components/Icon';
import { FlexRow } from 'modules/settings/styles';
import { IAction, ITrigger } from '../../types';
import TriggerDetailForm from '../../containers/forms/TriggerDetailForm';
import ModalTrigger from 'modules/common/components/ModalTrigger';

const actions: IAction[] = JSON.parse(localStorage.getItem('actions') || '[]');
const triggers: ITrigger[] = JSON.parse(
  localStorage.getItem('triggers') || '[]'
);

type Props = {
  closeModal: () => void;
  addTrigger: (value: string) => void;
};

class TriggerForm extends React.Component<Props> {
  onSave = () => {
    for (const action of actions) {
      action.style = jquery(`#action-${action.id}`).attr('style');
    }

    localStorage.setItem('actions', JSON.stringify(actions));

    for (const trigger of triggers) {
      trigger.style = jquery(`#trigger-${trigger.id}`).attr('style');
    }

    localStorage.setItem('triggers', JSON.stringify(triggers));
  };

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
        activeTrigger={key}
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
      </FlexRow>
    );
  }
}

export default TriggerForm;
