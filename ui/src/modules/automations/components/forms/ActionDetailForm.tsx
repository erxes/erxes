import { __ } from 'modules/common/utils';
import React from 'react';
// import Select from 'react-select-plus';
import { ModalFooter } from 'modules/common/styles/main';
import Button from 'modules/common/components/Button';
// import FormGroup from 'modules/common/components/form/Group';
// import ControlLabel from 'modules/common/components/form/Label';
import { IAction, ITrigger } from 'modules/automations/types';

type Props = {
  closeModal: () => void;
  closeParentModal?: () => void;
  currentAction: {
    trigger: ITrigger;
    action: IAction;
  };
  addAction: (value: string, contentId?: string) => void;
};

// type State = {
//   activeFormId: string;
// };

class TriggerDetailForm extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  onSave = () => {
    const {
      closeParentModal,
      closeModal,
      addAction,
      currentAction
    } = this.props;

    addAction(currentAction.action.type);
    closeParentModal ? closeParentModal() : closeModal();
  };

  render() {
    const { currentAction, closeModal } = this.props;
    console.log(currentAction);
    return (
      <>
        <div>content</div>
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

export default TriggerDetailForm;
