import React from 'react';
import { IAction } from 'modules/automations/types';
import { SegmentsForm } from 'modules/segments/containers';
import { ScrolledContent } from 'modules/automations/styles';

type Props = {
  activeAction: IAction;
  addAction: (action: IAction, id?: string, config?: any) => void;
  triggerType: string;
  closeModal: () => void;
};

type State = {
  queryLoaded: boolean;
  config?: any;
};

class IfForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      queryLoaded: false
    };
  }

  render() {
    const { activeAction, addAction, triggerType } = this.props;

    const config = activeAction.config || {};

    return (
      <ScrolledContent>
        <SegmentsForm
          {...this.props}
          contentType={triggerType || 'customer'}
          addConfig={addAction}
          closeModal={this.props.closeModal}
          activeTrigger={activeAction}
          id={config.contentId}
          isAutomation={true}
        />
      </ScrolledContent>
    );
  }
}

export default IfForm;
