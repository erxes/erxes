import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import Info from 'modules/common/components/Info';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import React from 'react';
import Select from 'react-select-plus';
import { Options } from '../../styles';
import { IIntegration, ISelectMessengerApps } from '../../types';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
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

  generateDoc = (values: { name: string }) => {
    const { selectedMessengerId, selectedFormId } = this.state;

    return {
      name: values.name,
      integrationId: selectedMessengerId,
      formId: selectedFormId
    };
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

  renderContent = (formProps: IFormProps) => {
    const { closeModal, integrations, leads, renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        <Info>
          {__(
            'Add a Lead here and see it on your Messenger Widget! In order to see Leads in your inbox, please make sure it is added in your channel'
          ) + '.'}
        </Info>
        <FormGroup>
          <ControlLabel required={true}>Name</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            required={true}
            autoFocus={true}
          />
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
          <ControlLabel required={true}>Pop Ups</ControlLabel>
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
            icon="times-circle"
            uppercase={false}
          >
            Cancel
          </Button>

          {renderButton({
            name: 'lead integration',
            values: this.generateDoc(values),
            isSubmitted,
            callback: closeModal
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default Lead;
