import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import React from 'react';
import Select from 'react-select-plus';
import { Options } from '../../styles';
import { IIntegration, ISelectMessengerApps } from '../../types';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
  integrations: IIntegration[];
};

type State = {
  selectedMessenger?: ISelectMessengerApps;
  selectedMessengerId: string;
};

class Website extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      selectedMessenger: undefined,
      selectedMessengerId: ''
    };
  }

  generateIntegrationsParams = integrations => {
    return integrations.map(integration => ({
      value: integration._id,
      label: integration.name || integration.title,
      brand: integration.brand
    }));
  };

  onChangeMessenger = obj => {
    this.setState({ selectedMessenger: obj });
    this.setState({ selectedMessengerId: obj ? obj.value : '' });
  };

  generateDoc = values => {
    return {
      integrationId: this.state.selectedMessengerId,
      name: values.name,
      description: values.description,
      buttonText: values.buttonText,
      url: values.url
    };
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
    const { closeModal, renderButton, integrations } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
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
            value={this.state.selectedMessenger}
            options={this.generateIntegrationsParams(integrations)}
            onChange={this.onChangeMessenger}
            optionRenderer={this.renderOption}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Description</ControlLabel>
          <FormControl
            {...formProps}
            componentClass="textarea"
            name="description"
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Button text</ControlLabel>
          <FormControl {...formProps} name="buttonText" required={true} />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Url</ControlLabel>
          <FormControl {...formProps} name="url" required={true} />
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
            name: 'website',
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

export default Website;
