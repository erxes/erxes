import {
  Button,
  ControlLabel,
  FormControl,
  FormGroup,
  Info
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import * as React from 'react';
import Select from 'react-select-plus';
import { __ } from '../../../../common/utils';
import { Options } from '../../styles';
import { IIntegration, ISelectMessengerApps } from '../../types';

type Props = {
  save: (
    params: { name: string; integrationId: string; formId: string },
    callback: () => void
  ) => void;
  integrations: IIntegration[];
  leads: IIntegration[];
  closeModal: () => void;
};

type State = {
  selectedMessenger?: ISelectMessengerApps;
  selectedMessengerId: string;
  selectedLead?: ISelectMessengerApps;
  selectedFormId: string;
};

class Lead extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      selectedMessengerId: '',
      selectedFormId: ''
    };
  }

  generateDoc() {
    const { selectedMessengerId, selectedFormId } = this.state;

    return {
      name: (document.getElementById('name') as HTMLInputElement).value,
      integrationId: selectedMessengerId,
      formId: selectedFormId
    };
  }

  handleSubmit = e => {
    e.preventDefault();

    this.props.save(this.generateDoc(), this.props.closeModal);
  };

  generateIntegrationsParams = integrations => {
    return integrations.map(integration => ({
      value: integration._id,
      label: integration.name,
      brand: integration.brand,
      form: integration.form && integration.form
    }));
  };

  onChangeMessenger = obj => {
    this.setState({ selectedMessenger: obj });
    this.setState({ selectedMessengerId: obj ? obj.value : '' });
  };

  onChangeLead = obj => {
    this.setState({ selectedLead: obj });
    this.setState({ selectedFormId: obj && obj.form ? obj.form._id : '' });
  };

  renderOption = option => {
    return (
      <Options>
        {option.label}
        <i>{option.brand && option.brand.name}</i>
      </Options>
    );
  };

  render() {
    const { closeModal, integrations, leads } = this.props;

    return (
      <form onSubmit={this.handleSubmit}>
        <Info>
          {__(
            'Add a Lead here and see it on your Messenger Widget! In order to see Leads in your inbox, please make sure it is added in your channel.'
          )}
        </Info>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>

          <FormControl id="name" type="text" required={true} autoFocus={true} />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Messenger integration</ControlLabel>

          <Select
            name="messengerIntegration"
            value={this.state.selectedMessenger}
            options={this.generateIntegrationsParams(integrations)}
            onChange={this.onChangeMessenger}
            optionRenderer={this.renderOption}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Lead</ControlLabel>

          <Select
            name="leadIntegration"
            value={this.state.selectedLead}
            options={this.generateIntegrationsParams(leads)}
            onChange={this.onChangeLead}
            optionRenderer={this.renderOption}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle="simple"
            type="button"
            onClick={closeModal}
            icon="cancel-1"
          >
            Cancel
          </Button>
          <Button btnStyle="success" type="submit" icon="checked-1">
            Save
          </Button>
        </ModalFooter>
      </form>
    );
  }
}

export default Lead;
