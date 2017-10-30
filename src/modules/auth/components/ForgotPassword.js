import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { FormGroup, FormControl, Col, Grid } from 'react-bootstrap';
import { Alert } from 'modules/common/utils';
import { AuthContent, AuthDescription, AuthBox } from '../styles';
import { Button } from 'modules/common/components';

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

    this.state = { email: '' };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
  }

  handleSubmit(e) {
    e.preventDefault();

    const { email } = this.state;

    this.props.forgotPassword({ email }, err => {
      if (!err) {
        window.location.href = '/sign-in';
      }
    });
  }

  handleEmailChange(e) {
    e.preventDefault();
    this.setState({ email: e.target.value });
  }

  render() {
    return (
      <AuthContent>
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
          </Col>
        </Grid>
      </AuthContent>
    );
  }
}

ForgotPassword.propTypes = propTypes;

export default ForgotPassword;
