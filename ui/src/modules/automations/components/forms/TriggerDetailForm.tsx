import React from 'react';
import { ITrigger } from 'modules/automations/types';
import { SegmentsForm } from 'modules/segments/containers';

type Props = {
  closeModal: () => void;
  activeTrigger: ITrigger;
  contentId?: string;
  addConfig: (trigger: ITrigger, contentId?: string, id?: string) => void;
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

    const config = activeTrigger.config || {};

    return (
      <>
        <SegmentsForm
          {...this.props}
          contentType={activeTrigger.type || 'customer'}
          closeModal={this.props.closeModal}
          id={config.contentId}
        />
      </>
    );
  }
}

export default TriggerDetailForm;
