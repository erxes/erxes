import { __ } from 'modules/common/utils';
import React from 'react';
// import Select from 'react-select-plus';
import { ModalFooter } from 'modules/common/styles/main';
import Button from 'modules/common/components/Button';
// import FormGroup from 'modules/common/components/form/Group';
// import ControlLabel from 'modules/common/components/form/Label';
import { IAction, ITrigger } from 'modules/automations/types';
import { IForm } from 'modules/forms/types';

type Props = {
  closeModal: () => void;
  closeParentModal?: () => void;
  fetchFormDetail: (_id: string, callback: (form: IForm) => void) => void;
  trigger: ITrigger;
  action: IAction;
};

type State = {
  form?: IForm;
};

class TriggerDetailForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);
  }

  onSave = () => {
    const { closeParentModal, closeModal } = this.props;

    // addTrigger(activeTrigger, activeFormId);
    closeParentModal ? closeParentModal() : closeModal();
  };

  onChangeForm = option => {
    // this.setState({ activeFormId: option.value });
  };

  render() {
    const { trigger, action } = this.props;
    const { config = {} } = trigger;

    if (
      action.type === 'if' &&
      trigger.type === 'formSubmit' &&
      config.contentId
    ) {
      const { fetchFormDetail } = this.props;
      fetchFormDetail(config.contentId, (form: IForm) => {
        console.log('FORM = ', form);

        if (form) {
          this.setState({
            form
          });
        }
      });
    }

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
