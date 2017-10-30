import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, FormControl, Button, Col, Grid } from 'react-bootstrap';
import { Alert } from 'modules/common/utils';
import { AuthContent, AuthDescription, AuthBox } from '../styles';

const propTypes = {
  token: PropTypes.string.isRequired,
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

    const { token, resetPassword } = this.props;

    resetPassword(token, this.state.newPassword, err => {
      if (err) {
        return Alert.error("Couldn't reset your password");
      }

      window.location.href = '/';
    });
  }

  handlePasswordChange(e) {
    e.preventDefault();

    this.setState({ newPassword: e.target.value });
  }

  render() {
    return (
      <AuthContent className="auth-content">
        <Grid>
          <Col md={7}>
            <AuthDescription>
              <img src="/images/logo.png" alt="erxes" />
              <h1>Customer engagement. Redefined.</h1>
              <p>
                erxes is an AI meets open source messaging platform for sales
                and marketing teams.
              </p>
              <a href="http://erxes.io/">« Go to home page</a>
            </AuthDescription>
          </Col>
          <Col md={5}>
            <AuthBox>
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
            </AuthBox>
          </Col>
        </Grid>
      </AuthContent>
    );
  }
}

ResetPassword.propTypes = propTypes;

export default ResetPassword;
