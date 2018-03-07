import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Button, FormControl, FormGroup } from 'modules/common/components';
import { AuthBox, Links } from '../styles';

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
    const { __ } = this.context;
    return (
      <AuthBox>
        <h2>{__('Reset your password')}</h2>
        <form onSubmit={this.handleSubmit}>
          <FormGroup>
            <FormControl
              type="email"
              placeholder={__('registered@email.com')}
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
