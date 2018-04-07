import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FormGroup, FormControl, InputGroup, Button } from 'react-bootstrap';
import { Icon } from 'modules/common/components';
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
            <InputGroup>
              <InputGroup.Button>
                <Button>
                  <Icon icon="android-lock" />
                </Button>
              </InputGroup.Button>
              <FormControl
                type="email"
                placeholder="registered@email.com"
                value={this.state.email}
                required
                onChange={this.handleEmailChange}
              />
            </InputGroup>
          </FormGroup>
          <Links>
            <Link to="/sign-in">Sign in</Link>
          </Links>
          <Button type="submit" block>
            Email me the instruction
          </Button>
        </form>
      </AuthBox>
    );
  }
}

ForgotPassword.propTypes = propTypes;
ForgotPassword.contextTypes = {
  __: PropTypes.func
};

export default ForgotPassword;
