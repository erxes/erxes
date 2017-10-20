import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, FormControl, Button } from 'react-bootstrap';

const propTypes = {
  loginWithPassword: PropTypes.func.isRequired,
};

class SignIn extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
    };

    this.loginWithPassword = this.loginWithPassword.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
  }

  // TODO:
  // loginWithPassword(e) {
  //   e.preventDefault();
  //
  //   const { email, password } = this.state;
  //
  //   this.props.loginWithPassword(email, password, err => {
  //     if (err) {
  //       return Alert.error('The username and password entered did not match. Give it another go?');
  //     }
  //
  //     return FlowRouter.go('/');
  //   });
  // }

  handleEmailChange(e) {
    e.preventDefault();
    this.setState({ email: e.target.value });
  }

  handlePasswordChange(e) {
    e.preventDefault();
    this.setState({ password: e.target.value });
  }

  render() {
    return (
      <div className="auth-content">
        <div className="container">
          <div className="col-md-7">
            <div className="auth-description">
              <img src="/images/logo.png" alt="erxes" />
              <h1>Customer engagement. Redefined.</h1>
              <p>
                erxes is an AI meets open source messaging platform for sales and marketing teams.
              </p>
              <a href="http://erxes.io/">« Go to home page</a>
            </div>
          </div>
          <div className="col-md-5">
            <div className="auth-box">
              <h2>Sign In</h2>
              <form onSubmit={this.loginWithPassword}>
                <FormGroup>
                  <FormControl
                    type="email"
                    placeholder="your@email.com"
                    value={this.state.email}
                    required
                    onChange={this.handleEmailChange}
                  />
                </FormGroup>
                <FormGroup>
                  <FormControl
                    type="password"
                    placeholder="password"
                    value={this.state.password}
                    required
                    onChange={this.handlePasswordChange}
                  />
                </FormGroup>
                <Button type="submit" block>Sign in</Button>
              </form>

              <div className="links">
                <a href="/forgot-password">
                  Forgot password?
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

SignIn.propTypes = propTypes;

export default SignIn;
