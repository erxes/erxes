import { __, readFile } from 'modules/common/utils';
import React from 'react';
import Form from 'modules/common/components/form/Form';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { Link } from 'react-router-dom';
import { AuthBox, AuthButton, Seperator } from '../styles';
import _ from 'lodash';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  currentOrganization: any;
};

class SignIn extends React.Component<Props> {
  renderContent = (formProps) => {
    const { values, isSubmitted } = formProps;
    const url = window.location.href;
    const demoUrl = url.includes('xosdemo.erxes.io');

    return (
      <>
        <FormGroup>
          <FormControl
            {...formProps}
            name="email"
            placeholder={demoUrl ? 'guest@erxes.io' : __('Enter your email')}
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <FormControl
            {...formProps}
            name="password"
            type="password"
            placeholder={demoUrl ? 'Demo@123' : __('Enter your password')}
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

        <AuthButton className="google">
          <Link to="/sign-in-with-email">
            {__('Sign in without password using magic link')}
          </Link>
        </AuthButton>
        <Seperator>or</Seperator>
        <Form renderContent={this.renderContent} />
        <Link to="/forgot-password">{__('Forgot password?')}</Link>
      </AuthBox>
    );
  }
}

export default SignIn;
