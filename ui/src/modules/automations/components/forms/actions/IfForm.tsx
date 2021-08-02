import React from 'react';

import { IAction, ITrigger } from 'modules/automations/types';
import { SegmentsForm } from 'modules/segments/containers';

type Props = {
  closeModal: () => void;
  closeParentModal?: () => void;
  activeTrigger: ITrigger;
  activeAction: IAction;
  addAction: (value: string, contentId?: string, config?: any) => void;
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
      addAction,
      activeAction
    } = this.props;

    addAction(activeAction.type);

    closeParentModal ? closeParentModal() : closeModal();
  };

  render() {
    const { closeModal } = this.props;

    return <SegmentsForm contentType="customer" closeModal={closeModal} />;
  }
}

export default IfForm;
