import React from 'react';
import { ITrigger } from 'modules/automations/types';
// import { TriggerForms } from './triggers';
import { SegmentsForm } from 'modules/segments/containers';

type Props = {
  closeModal: () => void;
  closeParentModal?: () => void;
  activeTrigger: ITrigger;
  contentId?: string;
  addConfig: (value: string, contentId?: string, id?: string) => void;
};

class TriggerDetailForm extends React.Component<Props> {
  render() {
    const { activeTrigger, closeModal } = this.props;

    // const Content = TriggerForms[activeTrigger.type] || TriggerForms.default;

    // return (
    //   <Content action={activeTrigger} onSave={this.onSave} {...this.props} />
    // );

    const config = activeTrigger.config || {};

    return (
      <SegmentsForm
        {...this.props}
        contentType={activeTrigger.type || 'customer'}
        closeModal={closeModal}
        id={config.contentId}
      />
    );
  }
}

export default TriggerDetailForm;
