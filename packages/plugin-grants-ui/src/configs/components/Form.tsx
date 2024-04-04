import React from 'react';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import {
  Button,
  Form as CommonForm,
  ControlLabel,
  FormControl,
  FormGroup,
  __,
  loadDynamicComponent
} from '@erxes/ui/src';
import { SelectActions } from '../../common/utils';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import CardsConfig from '../../cards/Configs';

type Props = {
  config?: any;
  closeModal: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

type State = {
  name: string;
  action: string;
  params: any;
  scope: string;
  config: any;
};

class ConfigForm extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = props?.config || {
      name: '',
      action: '',
      params: {},
      config: {}
    };

    this.renderForm = this.renderForm.bind(this);
  }
  handleSelect = (value, name, scope?) => {
    const updatedState = {
      ...this.state,
      [name]: value
    };

    if (scope) {
      updatedState.scope = scope;
    }

    this.setState({ ...updatedState });
  };

  generateDoc() {
    const { name, action, params, config, scope } = this.state;

    const updatedProps: any = {
      name,
      scope,
      action,
      params: JSON.stringify(params),
      config: JSON.stringify(config)
    };

    if (this.props.config) {
      updatedProps._id = this.props.config?._id;
    }

    return updatedProps;
  }

  renderConfig() {
    const { action, scope } = this.state;

    const updatedProps = {
      ...this.state,
      handleSelect: this.handleSelect
    };

    if (scope === 'cards') {
      return <CardsConfig {...updatedProps} />;
    }

    return loadDynamicComponent(
      'grantAction',
      {
        action: action,
        initialProps: updatedProps,
        handleSelect: params => this.handleSelect(params, 'params')
      },
      false,
      scope
    );
  }

  renderForm(formProps: IFormProps) {
    const { closeModal, renderButton, config } = this.props;
    const { action, params, name } = this.state;

    const handleChange = e => {
      const { value } = e.currentTarget as HTMLInputElement;

      this.setState({ name: value });
    };

    return (
      <>
        <FormGroup>
          <ControlLabel required>{__('Name')}</ControlLabel>
          <FormControl
            {...formProps}
            name="name"
            value={name}
            required
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required>{__('Actions')}</ControlLabel>
          <SelectActions
            label="Choose a action"
            name="action"
            initialValue={action}
            onSelect={this.handleSelect}
          />
        </FormGroup>
        {!!action && this.renderConfig()}
        <ModalFooter>
          <Button btnStyle="simple" onClick={closeModal}>
            {__('Close')}
          </Button>
          {renderButton({
            name: 'grant',
            text: 'Grant config',
            isSubmitted: formProps.isSubmitted,
            values: this.generateDoc(),
            object: config
          })}
        </ModalFooter>
      </>
    );
  }

  render() {
    return <CommonForm renderContent={this.renderForm} />;
  }
}

export default ConfigForm;
