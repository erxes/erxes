import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FormGroup, FormControl } from 'react-bootstrap';
import { Button } from 'modules/common/components';

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
      <div className="auth-box">
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

        <div className="links">
          <Link to="/sign-in">Sign in</Link>
        </div>
      </div>
    );
  }
}

ForgotPassword.propTypes = propTypes;

export default ForgotPassword;
