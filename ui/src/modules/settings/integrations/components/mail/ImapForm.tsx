import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import React from 'react';
import { IImapForm } from '../../types';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  kind: string;
  closeModal: () => void;
};

class ImapForm extends React.Component<Props> {
  generateDoc = ({
    email,
    password,
    imapHost,
    imapPort,
    smtpHost,
    smtpPort
  }: IImapForm) => {
    return {
      kind: this.props.kind,
      email,
      password,
      imapHost,
      smtpHost,
      imapPort: Number(imapPort),
      smtpPort: Number(smtpPort)
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
        {this.renderField({
          label: 'IMAP Host',
          type: 'text',
          name: 'imapHost',
          formProps
        })}
        {this.renderField({
          label: 'IMAP PORT',
          type: 'number',
          name: 'imapPort',
          formProps
        })}
        {this.renderField({
          label: 'SMTP Host',
          type: 'text',
          name: 'smtpHost',
          formProps
        })}
        {this.renderField({
          label: 'SMTP PORT',
          type: 'number',
          name: 'smtpPort',
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

export default ImapForm;
