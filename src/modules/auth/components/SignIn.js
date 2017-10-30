import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, FormControl, Button } from 'react-bootstrap';
import styled from 'styled-components';

const AuthBox = styled.div`
  background-color: #fff;
  padding: 70px 60px;
  border-radius: 4px;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
  h2 {
    color: #6b60a6;
    font-size: 30px;
    font-weight: 400;
    margin: 0 0 50px;
  }
  input {
    border: 0;
    border-bottom: 1px solid #ac8fdc;
    padding: 0 0 6px;
    color: #6b60a6;
    border-radius: 0;
    font-size: 16px;
  }
  button {
    -webkit-transition: background 0.2s ease;
    -moz-transition: background 0.2s ease;
    -ms-transition: background 0.2s ease;
    -o-transition: background 0.2s ease;
    transition: background 0.2s ease;
    background-color: #6b60a6;
    color: #fff;
    text-transform: uppercase;
    font-weight: 600;
    margin-top: 50px;
    border: 0;
    &:hover,
    .active.focus,
    .active:focus,
    .focus,
    :active.focus,
    :active:focus,
    :focus {
      background-color: #8981b8;
      color: #fff;
    }
  }
`;
const Links = styled.div`
  margin-top: 70px;
  text-align: center;
`;
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
      <AuthBox>
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
        <Links>
          <a href="/forgot-password">Forgot password?</a>
        </Links>
      </AuthBox>
    );
  }
}

SignIn.propTypes = propTypes;

export default SignIn;
