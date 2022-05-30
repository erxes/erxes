import FormControl from 'modules/common/components/form/Control';
import Form from 'modules/common/components/form/Form';
import FormGroup from 'modules/common/components/form/Group';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from 'modules/common/utils';
import React from 'react';
import { Link } from 'react-router-dom';
import { AuthBox } from '../styles';
import _ from 'lodash';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
};

class SignIn extends React.Component<Props> {
  renderContent = formProps => {
    const { values, isSubmitted } = formProps;
    const url = window.location.href;

    return (
      <>
        <FormGroup>
          {url === 'https://xosdemo.erxes.io/' ? (
            <FormControl
              {...formProps}
              name="email"
              defaultValue={'demo@erxes.io'}
              required={true}
            />
          ) : (
            <FormControl
              {...formProps}
              name="email"
              placeholder={__('Enter your email')}
              required={true}
            />
          )}
        </FormGroup>

        <FormGroup>
          {url === 'https://xosdemo.erxes.io/' ? (
            <FormControl
              {...formProps}
              name="email"
              defaultValue={'Demo@123'}
              required={true}
            />
          ) : (
            <FormControl
              {...formProps}
              name="password"
              type="password"
              placeholder={__('Enter your password')}
              required={true}
            />
          )}
        </FormGroup>

        <FormGroup>
          <FormControl className="toggle-message" componentClass="checkbox">
            {__('Remember me')}.
          </FormControl>
        </FormGroup>

        {this.props.renderButton({
          values,
          isSubmitted
        })}
      </>
    );
  };

  render() {
    return (
      <AuthBox>
        <img src="/images/logo-dark.png" alt="erxes" />
        <h2>{__('Welcome!')}</h2>
        <p>{__('Please sign in to your account to continue')}</p>
        <Form renderContent={this.renderContent} />
        <Link to="/forgot-password">{__('Forgot password?')}</Link>
      </AuthBox>
    );
  }
}

export default SignIn;
