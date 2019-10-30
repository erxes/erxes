import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import React from 'react';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  kind: string;
  closeModal: () => void;
};

class MailAuthForm extends React.Component<Props> {
  generateDoc = ({ email, password }: { email: string; password: string }) => {
    return {
      kind: this.props.kind,
      email,
      password
    };
  };

  renderField({
    label,
    type,
    name,
    formProps
  }: {
    label: string;
    type: string;
    name: string;
    formProps: IFormProps;
  }) {
    return (
      <FormGroup>
        <ControlLabel required={true}>{label}</ControlLabel>
        <FormControl {...formProps} type={type} name={name} required={true} />
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

export default MailAuthForm;
