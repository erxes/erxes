import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import React from 'react';
import { IExchangeForm } from '../../types';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  kind: string;
  closeModal: () => void;
};

class ExchangeForm extends React.Component<Props> {
  generateDoc = ({ email, password, username, host }: IExchangeForm) => {
    return {
      kind: this.props.kind,
      email,
      password,
      username,
      host
    };
  };

  renderField({
    label,
    type,
    name,
    required = true,
    formProps
  }: {
    label: string;
    type: string;
    name: string;
    required?: boolean;
    formProps: IFormProps;
  }) {
    return (
      <FormGroup>
        <ControlLabel required={required}>{label}</ControlLabel>
        <FormControl
          {...formProps}
          type={type}
          name={name}
          required={required}
        />
      </FormGroup>
    );
  }

  renderContent = (formProps: IFormProps) => {
    const { renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        {this.renderField({
          label: 'Email',
          type: 'email',
          name: 'email',
          formProps
        })}
        {this.renderField({
          label: 'Password',
          type: 'password',
          name: 'password',
          formProps
        })}
        {this.renderField({
          label: 'Username',
          type: 'text',
          name: 'username',
          required: false,
          formProps
        })}
        {this.renderField({
          label: 'Exchange server host',
          type: 'text',
          name: 'host',
          formProps
        })}

        <ModalFooter>
          {renderButton({
            name: 'integration',
            values: this.generateDoc(values),
            isSubmitted,
            callback: this.props.closeModal
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} />;
  }
}

export default ExchangeForm;
