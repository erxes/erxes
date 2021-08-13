import React from 'react';

import { IAction } from 'modules/automations/types';
import { SegmentsForm } from 'modules/segments/containers';
import { ScrolledContent } from 'modules/automations/styles';

type Props = {
  activeAction: IAction;
  addAction: (action: IAction, contentId?: string, actionId?: string) => void;
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
    const { activeAction, addAction } = this.props;

    const config = activeAction.config || {};

    return (
      <ScrolledContent>
        <SegmentsForm
          {...this.props}
          contentType={config.contentType || 'customer'}
          closeModal={() => null}
          addConfig={addAction}
          activeTrigger={activeAction}
          id={config.segmentId}
        />
      </ScrolledContent>
    );
  }
}

export default IfForm;
