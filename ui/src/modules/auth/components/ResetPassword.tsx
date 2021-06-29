import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import { __ } from 'modules/common/utils';
import React from 'react';
import { AuthBox } from '../styles';

type Props = {
  resetPassword: (newPassword: string) => void;
};

class ResetPassword extends React.Component<Props, { newPassword: string }> {
  constructor(props) {
    super(props);

    this.state = { newPassword: '' };
  }

  handleSubmit = e => {
    e.preventDefault();

    this.props.resetPassword(this.state.newPassword);
  };

  handlePasswordChange = e => {
    e.preventDefault();

    this.setState({ newPassword: e.target.value });
  };

  render() {
    return (
      <AuthBox>
        <h2>{__('Set your new password')}</h2>
        <form onSubmit={this.handleSubmit}>
          <FormGroup>
            <FormControl
              type="password"
              placeholder={__('new password')}
              required={true}
              onChange={this.handlePasswordChange}
            />
          </FormGroup>
          <Button btnStyle="success" type="submit" block={true}>
            Change password
          </Button>
        </form>
      </AuthBox>
    );
  }
}

export default ResetPassword;
