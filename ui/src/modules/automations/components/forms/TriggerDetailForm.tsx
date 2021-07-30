import { __ } from 'modules/common/utils';
import React from 'react';
import Select from 'react-select-plus';
import { ModalFooter } from 'modules/common/styles/main';
import Button from 'modules/common/components/Button';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ILeadIntegration } from 'modules/leads/types';
import { ITrigger } from 'modules/automations/types';

type Props = {
  closeModal: () => void;
  closeParentModal?: () => void;
  formIntegrations: ILeadIntegration[];
  activeTrigger: ITrigger;
  contentId?: string;
  addTrigger: (value: string, contentId?: string) => void;
};

type State = {
  activeIntegrationId: string;
  formId: string;
};

class TriggerDetailForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      activeIntegrationId: props.activeTrigger.config
        ? props.activeTrigger.config.contentId
        : '',
      formId: ''
    };
  }

  onSave = () => {
    const {
      addTrigger,
      activeTrigger,
      closeParentModal,
      closeModal
    } = this.props;

    const { activeIntegrationId } = this.state;

    addTrigger(activeTrigger.type, activeIntegrationId);

    closeParentModal ? closeParentModal() : closeModal();
  };

  onChangeForm = option => {
    const form = this.props.formIntegrations.find(e => e._id === option.value);

    if (!form) {
      return;
    }

    this.setState({ formId: form.formId, activeIntegrationId: option.value });
  };

  render() {
    const { formIntegrations } = this.props;

    const selectOptions = (array: ILeadIntegration[] = []) => {
      return array.map(item => ({ value: item._id, label: item.name }));
    };

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>{__('Select form')}</ControlLabel>
          <Select
            isRequired={true}
            value={this.state.activeIntegrationId}
            options={selectOptions(formIntegrations)}
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
