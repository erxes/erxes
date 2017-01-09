import React from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { FormGroup, FormControl, Button } from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';


const propTypes = {
  forgotPassword: React.PropTypes.func.isRequired,
};

class ForgotPassword extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
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
      return FlowRouter.go('auth/signIn');
    });
  }

  handleEmailChange(e) {
    e.preventDefault();
    this.setState({ email: e.target.value });
  }

  render() {
    return (
      <div className="auth-content">
        <div className="container">
          <div className="col-md-7">
            <div className="auth-description">
              <img src="/assets/images/logo.png" alt="erxes" />
              <h1>Customer engagement. Redefined.</h1>
              <p>
                erxes is an open-source messaging platform for customer success
              </p>
              <a href="http://erxes.io/">&laquo; Go to home page</a>
            </div>
          </div>
          <div className="col-md-5">
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
                <a href={FlowRouter.path('auth/signIn')}>
                  Sign in
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

ForgotPassword.propTypes = propTypes;

export default ForgotPassword;
