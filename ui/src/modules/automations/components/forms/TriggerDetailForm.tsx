import React from 'react';
import { ITrigger } from 'modules/automations/types';
// import { TriggerForms } from './triggers';
import { SegmentsForm } from 'modules/segments/containers';
// import SelectSegment from 'modules/automations/containers/forms/triggers/SelectSegment';

type Props = {
  closeModal: () => void;
  closeParentModal?: () => void;
  activeTrigger: ITrigger;
  contentId?: string;
  addConfig: (value: string, contentId?: string, id?: string) => void;
};

class TriggerDetailForm extends React.Component<
  Props,
  { activeTrigger: ITrigger }
> {
  constructor(props) {
    super(props);

    this.state = {
      activeTrigger: props.activeTrigger
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activeTrigger !== this.props.activeTrigger) {
      this.setState({ activeTrigger: nextProps.activeTrigger });
    }
  }

  render() {
    const { activeTrigger } = this.state;

    // const Content = TriggerForms[activeTrigger.type] || TriggerForms.default;

    // return (
    //   <Content action={activeTrigger} onSave={this.onSave} {...this.props} />
    // );

    const config = activeTrigger.config || {};

    return (
      <>
        {/* <SelectSegment
          isRequired={true}
          formProps={{}}
          description={
            'description'
          }
        /> */}
        <SegmentsForm
          {...this.props}
          contentType={activeTrigger.type || 'customer'}
          closeModal={this.props.closeModal}
          id={config.contentId}
          isAutomation={true}
        />
      </>
    );
  }
}

export default TriggerDetailForm;
