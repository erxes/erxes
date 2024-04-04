import { __, readFile } from 'modules/common/utils';

import { AuthBox } from '../styles';
import Form from 'modules/common/components/form/Form';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { Link } from 'react-router-dom';
import React from 'react';
import _ from 'lodash';
import { getThemeItem } from '@erxes/ui/src/utils/core';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

class SignIn extends React.Component<Props> {
  renderContent = formProps => {
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
          isSubmitted
        })}
      </>
    );
  };

  renderLogo() {
    const logo = '/images/logo-dark.png';
    const thLogo = getThemeItem('logo');
    return thLogo && typeof thLogo === 'string' ? readFile(thLogo) : logo;
  }

  render() {
    return (
      <AuthBox>
        <img src={this.renderLogo()} alt="erxes" />
        <h2>{__('Welcome!')}</h2>
        <p>{__('Please sign in to your account to continue')}</p>
        <Form renderContent={this.renderContent} />
        <Link to="/forgot-password">{__('Forgot password?')}</Link>
      </AuthBox>
    );
  }
}

export default SignIn;
