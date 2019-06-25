import {
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { ModalFooter } from 'modules/common/styles/main';
import { IButtonMutateProps, IFormProps } from 'modules/common/types';
import { __, Alert } from 'modules/common/utils';
import * as React from 'react';

type Props = {
  renderButton: (props: IButtonMutateProps) => void;
  closeModal: () => void;
};

type State = {
  isSubmitted: boolean;
};

class ChangePassword extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      isSubmitted: false
    };
  }

  onSubmit = values => {
    if (values.newPassword !== values.confirmation) {
      return Alert.error("Password didn't match");
    }

    return this.setState({ isSubmitted: true });
  };

  renderContent = (formProps: IFormProps) => {
    const { values } = formProps;

    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Current Password</ControlLabel>
          <FormControl
            {...formProps}
            type="password"
            placeholder={__('Current password')}
            name="currentPassword"
            required={true}
          />
        </FormGroup>

        <br />

        <FormGroup>
          <ControlLabel required={true}>New Password</ControlLabel>
          <FormControl
            {...formProps}
            type="password"
            placeholder={__('Enter new password')}
            name="newPassword"
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>
            Re-type Password to confirm
          </ControlLabel>
          <FormControl
            {...formProps}
            type="password"
            placeholder={__('Re-type password')}
            name="confirmation"
            required={true}
          />
        </FormGroup>
        <ModalFooter>
          <Button
            btnStyle="simple"
            onClick={this.props.closeModal}
            icon="cancel-1"
          >
            Close
          </Button>

          {this.props.renderButton({
            values,
            isSubmitted: this.state.isSubmitted,
            callback: this.props.closeModal
          })}
        </ModalFooter>
      </>
    );
  };

  render() {
    return <Form renderContent={this.renderContent} onSubmit={this.onSubmit} />;
  }
}

export default ChangePassword;
