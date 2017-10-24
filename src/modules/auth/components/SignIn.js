import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, FormControl, Button } from 'react-bootstrap';

const propTypes = {
  login: PropTypes.func.isRequired
};

class SignIn extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: ''
    };

    this.login = this.login.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
  }

  login(e) {
    e.preventDefault();

    const { email, password } = this.state;

    this.props.login({ email, password });
  }

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
      <div className="auth-box">
        <h2>Sign In</h2>
        <form onSubmit={this.login}>
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
          <Button type="submit" block>
            Sign in
          </Button>
        </form>

        <div className="links">
          <a href="/forgot-password">Forgot password?</a>
        </div>
      </div>
    );
  }
}

SignIn.propTypes = propTypes;

export default SignIn;
