import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { FormGroup, ControlLabel, FormControl, Button, Well } from 'react-bootstrap';
import Alert from 'meteor/erxes-notifier';

const propTypes = {
  createUser: PropTypes.func.isRequired,
};

class SignUp extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      email: '',
      password: '',
      fullName: '',
    };

    this.createUser = this.createUser.bind(this);
    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleFullNameChange = this.handleFullNameChange.bind(this);
  }

  createUser(e) {
    e.preventDefault();

    const { username, email, password, fullName } = this.state;
    const user = { username, email, password, fullName };

    this.props.createUser(user, err => {
      if (err) {
        return Alert.error('Could not sign up', err.reason);
      }

      Alert.success('Successfully signed up', 'Please check your email');
      return FlowRouter.go('/');
    });
  }

  handleEmailChange(e) {
    e.preventDefault();
    this.setState({ email: e.target.value });
  }

  handleUsernameChange(e) {
    e.preventDefault();
    this.setState({ username: e.target.value });
  }

  handlePasswordChange(e) {
    e.preventDefault();
    this.setState({ password: e.target.value });
  }

  handleFullNameChange(e) {
    e.preventDefault();
    this.setState({ fullName: e.target.value });
  }

  render() {
    return (
      <Well>
        <h1>Sign Up</h1>
        <form onSubmit={this.createUser}>
          <FormGroup>
            <ControlLabel>Email</ControlLabel>
            <FormControl
              type="text"
              placeholder="Email"
              value={this.state.email}
              onChange={this.handleEmailChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Username</ControlLabel>
            <FormControl
              type="text"
              placeholder="Username"
              value={this.state.username}
              onChange={this.handleUsernameChange}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Full name</ControlLabel>
            <FormControl
              type="text"
              placeholder="Full name"
              value={this.state.fullName}
              onChange={this.handleFullNameChange}
            />
          </FormGroup>
          <FormGroup>
            <ControlLabel>Password</ControlLabel>
            <FormControl
              type="password"
              placeholder="Password"
              value={this.state.password}
              onChange={this.handlePasswordChange}
              required
            />
          </FormGroup>
          <Button type="submit">
            Sign up
          </Button>
        </form>
        <p>
          <a href={FlowRouter.path('auth/signIn')}>Already have an account?</a>
        </p>
      </Well>
    );
  }
}

SignUp.propTypes = propTypes;

export default SignUp;
