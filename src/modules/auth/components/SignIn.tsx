import { Button, FormControl, FormGroup } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { AuthBox, Links } from '../styles';

type Props = {
  login: (doc: { email: string; password: string }) => void;
};

type State = {
  email: string;
  password: string;
};

class SignIn extends React.Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: ''
    };
  }

  login = e => {
    e.preventDefault();

    const { email, password } = this.state;

    this.props.login({ email, password });
  };

  handleEmailChange = e => {
    e.preventDefault();
    this.setState({ email: e.target.value });
  };

  handlePasswordChange = e => {
    e.preventDefault();
    this.setState({ password: e.target.value });
  };

  render() {
    return (
      <AuthBox>
        <h2>{__('Sign in')}</h2>
        <form onSubmit={this.login}>
          <FormGroup>
            <FormControl
              placeholder={__('Username or email')}
              value={this.state.email}
              required={true}
              onChange={this.handleEmailChange}
            />
          </FormGroup>
          <FormGroup>
            <FormControl
              type="password"
              placeholder={__('password')}
              value={this.state.password}
              required={true}
              onChange={this.handlePasswordChange}
            />
          </FormGroup>
          <Button btnStyle="success" type="submit" block={true}>
            Sign in
          </Button>
        </form>
        <Links>
          <Link to="/forgot-password">{__('Forgot password?')}</Link>
        </Links>
      </AuthBox>
    );
  }
}

export default SignIn;
