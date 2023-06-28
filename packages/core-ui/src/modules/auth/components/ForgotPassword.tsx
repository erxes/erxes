import { getThemeItem } from '@erxes/ui/src/utils/core';
import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import { readFile, __ } from 'modules/common/utils';
import React from 'react';
import { Link } from 'react-router-dom';
import { AuthBox } from '../styles';

type Props = {
  forgotPassword: (
    doc: { email: string },
    callback: (e: Error) => void
  ) => void;
};

class ForgotPassword extends React.Component<Props, { email: string }> {
  constructor(props) {
    super(props);

    this.state = { email: '' };
  }

  handleSubmit = e => {
    e.preventDefault();

    const { email } = this.state;

    this.props.forgotPassword({ email }, err => {
      if (!err) {
        window.location.href = '/sign-in';
      }
    });
  };

  handleEmailChange = e => {
    e.preventDefault();
    this.setState({ email: e.target.value });
  };

  renderLogo() {
    const logo = '/images/logo-dark.png';
    const thLogo = getThemeItem('logo');
    return thLogo && typeof thLogo === 'string'
      ? readFile(thLogo)
      : `/images/${logo}`;
  }

  render() {
    return (
      <AuthBox>
        <img src={this.renderLogo()} alt="erxes" />
        <h2>{__('Reset your password')}</h2>
        <p>{__('Please reset your password via email')}</p>
        <form onSubmit={this.handleSubmit}>
          <FormGroup>
            <FormControl
              type="email"
              placeholder={__('Enter your email')}
              value={this.state.email}
              required={true}
              onChange={this.handleEmailChange}
            />
          </FormGroup>
          <Button type="submit" block={true}>
            Email me the instruction
          </Button>
        </form>
        <Link to="/sign-in">{__('Sign in')}</Link>
      </AuthBox>
    );
  }
}

export default ForgotPassword;
