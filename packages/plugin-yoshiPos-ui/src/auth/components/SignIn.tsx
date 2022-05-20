import FormControl from '../..//common/components/form/Control';
import Form from '../..//common/components/form/Form';
import FormGroup from '../..//common/components/form/Group';
import { IButtonMutateProps, IConfig } from '../../types';
import { __ } from '../..//common/utils';
import React from 'react';
import { Link } from 'react-router-dom';
import { AuthBox, Links } from '../styles';

type Props = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  currentConfig: IConfig;
};

class SignIn extends React.Component<Props> {
  renderContent = formProps => {
    const { values, isSubmitted } = formProps;

    return (
      <>
        <FormGroup>
          <FormControl
            {...formProps}
            name="email"
            placeholder={__('registered@email.com')}
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

        {this.props.renderButton({
          values,
          isSubmitted
        })}
      </>
    );
  };

  render() {
    const { currentConfig } = this.props;
    const { colors = {} } = currentConfig.uiOptions || {};

    return (
      <AuthBox mainColor={colors.primary}>
        <h2>{__('Sign in')}</h2>
        <Form renderContent={this.renderContent} />
        <Links>
          <Link to="/forgot-password">{__('Forgot password?')}</Link>
        </Links>
      </AuthBox>
    );
  }
}

export default SignIn;
