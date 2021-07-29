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
  trigger?: ITrigger;
  action: IAction;
};

// type State = {
//   activeFormId: string;
// };

class TriggerDetailForm extends React.Component<Props> {
  constructor(props) {
    super(props);
  }

  onSave = () => {
    const { closeParentModal, closeModal } = this.props;

    // addTrigger(activeTrigger, activeFormId);
    closeParentModal ? closeParentModal() : closeModal();
  };

  onChangeForm = option => {
    this.setState({ activeFormId: option.value });
  };

  render() {
    return (
      <>
        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={this.props.closeModal}
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
