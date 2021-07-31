import React from 'react';
import { ITrigger } from 'modules/automations/types';
import { TriggerForms } from './triggers';

type Props = {
  closeModal: () => void;
  closeParentModal?: () => void;
  activeTrigger: ITrigger;
  contentId?: string;
  addTrigger: (value: string, contentId?: string, triggerId?: string) => void;
};

class TriggerDetailForm extends React.Component<Props> {
  onSave = contentId => {
    const {
      addTrigger,
      activeTrigger,
      closeParentModal,
      closeModal
    } = this.props;

    addTrigger(activeTrigger.type, contentId, activeTrigger.id);

    closeParentModal ? closeParentModal() : closeModal();
  };

  render() {
    const { activeTrigger } = this.props;

    const Content = TriggerForms[activeTrigger.type] || TriggerForms.default;

    return (
      <Content action={activeTrigger} onSave={this.onSave} {...this.props} />
    );
  }
}

export default TriggerDetailForm;
