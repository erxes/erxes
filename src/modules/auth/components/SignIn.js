import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Form,
  Button,
  FormControl,
  FormGroup
} from 'modules/common/components';
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
  }

  login(doc) {
    const { email, password } = doc;

    this.props.login({ email, password });
  }

  render() {
    const { __ } = this.context;
    return (
      <AuthBox>
        <h2>{__('Sign in')}</h2>
        <Form onSubmit={this.login}>
          <FormGroup>
            <FormControl
              type="email"
              placeholder={__('your@email.com')}
              value={this.state.email}
              name="email"
              validations="isEmail"
              validationError="Please enter an email"
            />
          </FormGroup>
          <FormGroup>
            <FormControl
              type="password"
              name="password"
              validations="isValue"
              validationError="Please enter a password"
              placeholder={__('password')}
              value={this.state.password}
            />
          </FormGroup>
          <Button type="submit" block>
            Sign in
          </Button>
        </Form>
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
