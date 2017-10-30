import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, FormControl, FormGroup } from 'modules/common/components';

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
    return (
      <div className="auth-box">
        <h2>Set your new password</h2>
        <form onSubmit={this.handleSubmit}>
          <FormGroup>
            <FormControl
              type="password"
              placeholder="new password"
              required
              onChange={this.handlePasswordChange}
            />
          </FormGroup>
          <Button type="submit" block>
            Change password
          </Button>
        </form>
      </div>
    );
  }
}

ResetPassword.propTypes = propTypes;

export default ResetPassword;
