import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Button, FormControl, FormGroup } from 'modules/common/components';
import { AuthBox, Links } from '../styles';

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
    const { __ } = this.context;
    return (
      <AuthBox>
        <h2>{__('Sign in')}</h2>
        <form onSubmit={this.login}>
          <FormGroup>
            <FormControl
              type="email"
              placeholder={__('your@email.com')}
              value={this.state.email}
              required
              onChange={this.handleEmailChange}
            />
          </FormGroup>
          <FormGroup>
            <FormControl
              type="password"
              placeholder={__('password')}
              value={this.state.password}
              required
              onChange={this.handlePasswordChange}
            />
          </FormGroup>
          <Button btnStyle="success" type="submit" block>
            Sign in
          </Button>
        </form>
        <Links>
          <Link to="/forgot-password">{__('Forgot password?')}</Link>
        </Links>
      </AuthBox>
    );
  }
}

SignIn.propTypes = propTypes;
SignIn.contextTypes = {
  __: PropTypes.func
};

export default SignIn;
