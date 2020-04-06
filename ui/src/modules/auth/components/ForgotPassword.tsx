import Button from 'modules/common/components/Button';
import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import { __ } from 'modules/common/utils';
import React from 'react';
import { Link } from 'react-router-dom';
import { AuthBox, Links } from '../styles';

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

  render() {
    return (
      <AuthBox>
        <h2>{__('Reset your password')}</h2>
        <form onSubmit={this.handleSubmit}>
          <FormGroup>
            <FormControl
              type="email"
              placeholder={__('registered@email.com')}
              value={this.state.email}
              required={true}
              onChange={this.handleEmailChange}
            />
          </FormGroup>
          <Button btnStyle="success" type="submit" block={true}>
            Email me the instruction
          </Button>
        </form>
        <Links>
          <Link to="/sign-in">{__('Sign in')}</Link>
        </Links>
      </AuthBox>
    );
  }
}

export default ForgotPassword;
