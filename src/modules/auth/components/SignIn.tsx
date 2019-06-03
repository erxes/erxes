import {
  Button,
  Form,
  FormControl,
  FormGroup
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { AuthBox, Links } from '../styles';

type Props = {
  login: (doc: { email: string; password: string }) => void;
};

class SignIn extends React.Component<Props> {
  login = values => {
    this.props.login(values);
  };

  renderContent = formProps => {
    return (
      <>
        <FormGroup>
          <FormControl
            {...formProps}
            name="email"
            placeholder={__('Username or email')}
            required={true}
          />
        </FormGroup>
        <FormGroup>
          <FormControl
            {...formProps}
            name="password"
            type="password"
            placeholder={__('password')}
            required={true}
          />
        </FormGroup>
        <Button btnStyle="success" type="submit" block={true}>
          Sign in
        </Button>
      </>
    );
  };

  render() {
    return (
      <AuthBox>
        <h2>{__('Sign in')}</h2>
        <Form renderContent={this.renderContent} onSubmit={this.login} />
        <Links>
          <Link to="/forgot-password">{__('Forgot password?')}</Link>
        </Links>
      </AuthBox>
    );
  }
}

export default SignIn;
