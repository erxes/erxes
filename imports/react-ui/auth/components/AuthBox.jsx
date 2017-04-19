import React from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';

const propTypes = {
  user: React.PropTypes.object,
  loggingIn: React.PropTypes.bool.isRequired,
  loginWithPassword: React.PropTypes.func.isRequired,
  logout: React.PropTypes.func.isRequired,
};

class AuthBox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
    };

    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleEmailChange = this.handleEmailChange.bind(this);
    this.handlePasswordChange = this.handlePasswordChange.bind(this);
  }

  login(e) {
    e.preventDefault();

    const { email, password } = this.state;
    this.props.loginWithPassword(email, password);
  }

  logout(e) {
    e.preventDefault();

    this.props.logout(() => {
      FlowRouter.go('auth/signIn');
    });
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
    const { user, loggingIn } = this.props;

    if (loggingIn) {
      return <div>Logging in ...</div>;
    }

    if (user) {
      return (
        <div>
          {user.emails[0].address} |&nbsp;
          <a href="#">Change password</a> |&nbsp;
          <a href="#" onClick={this.logout}>Sign out</a>
        </div>
      );
    }

    return (
      <div>
        <form onSubmit={this.login}>
          <input
            type="text"
            placeholder="Email"
            value={this.state.email}
            onChange={this.handleEmailChange}
          />
          <input
            type="password"
            placeholder="Password"
            value={this.state.password}
            onChange={this.handlePasswordChange}
          />
          <input type="submit" value="Sign in" />
        </form>
      </div>
    );
  }
}

AuthBox.propTypes = propTypes;

export default AuthBox;
