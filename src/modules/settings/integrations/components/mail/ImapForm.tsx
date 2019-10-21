import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import React from 'react';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  closeModal: () => void;
};

class ImapForm extends React.Component<Props> {
  generateDoc = (values: { email: string; password: string }) => {
    return {
      email: values.email,
      password: values.password
    };
  };

  renderContent = (formProps: IFormProps) => {
    const { renderButton } = this.props;
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Email</ControlLabel>
          <FormControl
            {...formProps}
            type="email"
            name="email"
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Password</ControlLabel>
          <FormControl
            {...formProps}
            type="password"
            name="password"
            required={true}
          />
        </FormGroup>

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
