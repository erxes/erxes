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
  forgotPassword: PropTypes.func.isRequired
};

class ForgotPassword extends Component {
  constructor(props) {
    super(props);

    this.state = { email: '' };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(doc) {
    const email = doc.email;

    this.props.forgotPassword({ email }, err => {
      if (!err) {
        window.location.href = '/sign-in';
      }
    });
  }

  render() {
    const { __ } = this.context;
    return (
      <AuthBox>
        <h2>{__('Reset your password')}</h2>
        <Form onSubmit={this.handleSubmit}>
          <FormGroup>
            <FormControl
              type="email"
              name="email"
              placeholder={__('registered@email.com')}
              value={this.state.email}
              validations="isEmail"
              validationError="Please enter an email"
            />
          </FormGroup>
          <Button type="submit" block>
            Email me the instruction
          </Button>
        </Form>
        <Links>
          <Link to="/sign-in">{__('Sign in')}</Link>
        </Links>
      </AuthBox>
    );
  }
}

ForgotPassword.propTypes = propTypes;
ForgotPassword.contextTypes = {
  __: PropTypes.func
};

export default ForgotPassword;
