import { __ } from 'modules/common/utils';
import React from 'react';
import { ModalFooter } from 'modules/common/styles/main';
import Button from 'modules/common/components/Button';
import { IAction, ITrigger } from 'modules/automations/types';

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

    return (
      <>
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="times-circle"
          >
            {__('Cancel')}
          </Button>

          <Button btnStyle="success" icon="checked-1" onClick={this.onSave}>
            Save
          </Button>
        </ModalFooter>
      </>
    );
  }
}

export default IfForm;
