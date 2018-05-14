import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Form,
  Button,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { AuthBox } from '../styles';

const propTypes = {
  resetPassword: PropTypes.func.isRequired
};

class ResetPassword extends Component {
  constructor(props) {
    super(props);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(doc) {
    this.props.resetPassword(doc.newPassword);
  }

  render() {
    const { __ } = this.context;
    return (
      <AuthBox>
        <h2>{__('Set your new password')}</h2>
        <Form onSubmit={this.handleSubmit}>
          <FormGroup>
            <FormControl
              name="newPassword"
              type="password"
              validations="isValue"
              validationError="Please enter a new password"
              placeholder={__('new password')}
            />
          </FormGroup>
          <Button type="submit" block>
            Change password
          </Button>
        </Form>
      </AuthBox>
    );
  }
}

ResetPassword.propTypes = propTypes;
ResetPassword.contextTypes = {
  __: PropTypes.func
};

export default ResetPassword;
