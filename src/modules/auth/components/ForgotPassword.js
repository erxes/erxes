import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, FormControl, Button } from 'react-bootstrap';
import { Alert } from 'modules/common/utils';
import styled from 'styled-components';
import {
  AuthContent,
  Container,
  Divcolmd7,
  AuthDescription,
  Divcolmd5,
  AuthBox
} from '../styles';
const Links = styled.div`
  margin-top: 70px;
  text-align: center;
`;
const propTypes = {
  forgotPassword: PropTypes.func.isRequired
};

class ForgotPassword extends Component {
  constructor(props) {
    super(props);

    this.state = {
      email: ''
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();

    const { email } = this.state;

    this.props.forgotPassword({ email }, err => {
      if (err) {
        return Alert.error('Email address is not registered');
      }

      Alert.success('Password reset instruction is sent to your email');

      window.location.href = '/sign-in';
    });
  }

  handleEmailChange(e) {
    e.preventDefault();
    this.setState({ email: e.target.value });
  }

  render() {
    return (
      <AuthContent>
        <Container>
          <Divcolmd7>
            <AuthDescription>
              <img src="/images/logo.png" alt="erxes" />
              <h1>Customer engagement. Redefined.</h1>
              <p>
                erxes is an AI meets open source messaging platform for sales
                and marketing teams.
              </p>
              <a href="http://erxes.io/">« Go to home page</a>
            </AuthDescription>
          </Divcolmd7>
          <Divcolmd5>
            <AuthBox>
              <h2>Reset your password</h2>
              <form onSubmit={this.handleSubmit}>
                <FormGroup>
                  <FormControl
                    type="email"
                    placeholder="registered@email.com"
                    value={this.state.email}
                    required
                    onChange={this.handleEmailChange}
                  />
                </FormGroup>
                <Button type="submit" block>
                  Email me the instruction
                </Button>
              </form>
              <Links>
                <a href="/sign-in">Sign in</a>
              </Links>
            </AuthBox>
          </Divcolmd5>
        </Container>
      </AuthContent>
    );
  }
}

ForgotPassword.propTypes = propTypes;

export default ForgotPassword;
