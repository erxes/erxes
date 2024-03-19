import React from 'react';
import { Link } from 'react-router-dom';

import { IButtonMutateProps } from '@erxes/ui/src/types';
import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import { __ } from 'modules/common/utils';
import { AuthBox, AuthButton, Seperator } from '../styles';
import { readFile } from 'modules/common/utils';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  loginViaGoogle: () => void;
  currentOrganization: any;
};

class SignInWithEmail extends React.Component<Props> {
  renderContent = (formProps) => {
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FormGroup>
          <FormControl
            {...formProps}
            name="email"
            placeholder={__('Enter your work email')}
            required={true}
          />
        </FormGroup>

        {this.props.renderButton({
          values,
          isSubmitted,
        })}
      </>
    );
  };

  render() {
    const { logo, backgroundColor } = this.props.currentOrganization;

    return (
      <AuthBox backgroundColor={backgroundColor}>
        <img src={readFile(logo) || '/images/logo-dark.png'} alt="erxes" />
        <h2>{__('Welcome!')}</h2>
        <p>{__('Please sign in to your account to continue')}</p>
        <AuthButton
          onClick={() => this.props.loginViaGoogle()}
          className="google"
        >
          <img src="/images/google.svg" alt="google" />
          Sign in with Google
        </AuthButton>
        <br />
        <AuthButton className="google">
          <Link to="/sign-in">{__('Sign in with email and password')}</Link>
        </AuthButton>
        <Seperator>or</Seperator>
        <span>
          We use magic link so you don't have to remember or type in yet another
          long password
        </span>
        <Form renderContent={this.renderContent} />
      </AuthBox>
    );
  }
}

export default SignInWithEmail;
