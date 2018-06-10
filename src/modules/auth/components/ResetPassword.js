import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, FormControl, FormGroup } from 'modules/common/components';
import { AuthBox } from '../styles';

const propTypes = {
  resetPassword: PropTypes.func.isRequired
};

class ResetPassword extends Component {
  constructor(props) {
    super(props);

    this.state = { newPassword: '' };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();

    this.props.resetPassword(this.state.newPassword);
  }

  handlePasswordChange(e) {
    e.preventDefault();

    this.setState({ newPassword: e.target.value });
  }

  render() {
    const { __ } = this.context;
    return (
      <AuthBox>
        <h2>{__('Set your new password')}</h2>
        <form onSubmit={this.handleSubmit}>
          <FormGroup>
            <FormControl
              type="password"
              placeholder={__('new password')}
              required
              onChange={this.handlePasswordChange}
            />
          </FormGroup>
          <Button btnStyle="success" type="submit" block>
            Change password
          </Button>
        </form>
      </AuthBox>
    );
  }
}

ResetPassword.propTypes = propTypes;
ResetPassword.contextTypes = {
  __: PropTypes.func
};

export default ResetPassword;
