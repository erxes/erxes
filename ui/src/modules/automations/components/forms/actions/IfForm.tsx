import React from 'react';

import { IAction, ITrigger } from 'modules/automations/types';
import { SegmentsForm } from 'modules/segments/containers';

type Props = {
  closeModal: () => void;
  closeParentModal?: () => void;
  activeTrigger: ITrigger;
  activeAction: IAction;
  addConfig: (trigger: ITrigger, contentId?: string, config?: any) => void;
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

  onSave = () => {
    const {
      closeParentModal,
      closeModal,
      addConfig,
      activeAction
    } = this.props;

    addConfig(activeAction);

    closeParentModal ? closeParentModal() : closeModal();
  };

  render() {
    const { closeModal, activeAction } = this.props;

    const config = activeAction.config || {};

    return (
      <SegmentsForm
        {...this.props}
        contentType={config.contentType || 'customer'}
        closeModal={closeModal}
        id={config.segmentId}
      />
    );
  }
}

export default IfForm;
