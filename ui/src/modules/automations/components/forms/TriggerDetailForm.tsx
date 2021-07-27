import { __ } from 'modules/common/utils';
import React from 'react';
import Select from 'react-select-plus';
import { ModalFooter } from 'modules/common/styles/main';
import Button from 'modules/common/components/Button';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ILeadIntegration } from 'modules/leads/types';

type Props = {
  closeModal: () => void;
  closeParentModal?: () => void;
  forms: ILeadIntegration[];
  activeTrigger: string;
  addTrigger: (value: string) => void;
};

type State = {
  activeFormId: string;
};

class TriggerDetailForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      activeFormId: ''
    };
  }

  onSave = () => {
    const {
      addTrigger,
      activeTrigger,
      closeParentModal,
      closeModal
    } = this.props;

    addTrigger(activeTrigger);

    closeParentModal ? closeParentModal() : closeModal();
  };

  onChangeForm = option => {
    this.setState({ activeFormId: option.value });
  };

  render() {
    const { forms } = this.props;

    const selectOptions = (array: ILeadIntegration[] = []) => {
      return array.map(item => ({ value: item._id, label: item.name }));
    };

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>{__('Select form')}</ControlLabel>
          <Select
            isRequired={true}
            value={this.state.activeFormId}
            options={selectOptions(forms)}
            onChange={this.onChangeForm}
            placeholder={__('Select')}
          />
        </FormGroup>
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
