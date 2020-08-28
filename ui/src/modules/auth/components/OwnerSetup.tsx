import Button from 'modules/common/components/Button';
import { FormControl, FormGroup } from 'modules/common/components/form';
import { Alert } from 'modules/common/utils';
import { PasswordWithEye } from 'modules/layout/styles';
import React from 'react';
import { useState } from 'react';
import { AuthBox } from '../styles';
import { IOwner } from '../types';

type Props = {
  createOwner: (arg: IOwner) => void;
};

const OwnerSetup = (props: Props) => {
  const { createOwner } = props;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [subscribeEmail, setSubscribeEmail] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();

    if (!firstName) {
      return Alert.error(
        'We would love your real first name, but you are free to choose any name you want to be called.'
      );
    }

    if (!email) {
      return Alert.error(
        'Your best email address is required. You will want to receive these notifications.'
      );
    }

    if (!password) {
      return Alert.error('Your password is required.');
    }

    createOwner({
      email,
      password,
      firstName,
      lastName,
      subscribeEmail
    });
  };

  const handleFirstName = e => {
    e.preventDefault();

    setFirstName(e.target.value);
  };

  const handleLastName = e => {
    e.preventDefault();

    setLastName(e.target.value);
  };

  const handleEmail = e => {
    e.preventDefault();

    setEmail(e.target.value);
  };

  const handlePassword = e => {
    e.preventDefault();

    setPassword(e.target.value);
  };

  const toggleSubscribeEmail = e => {
    setSubscribeEmail(e.target.checked);
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <AuthBox type="setup">
      <h2 className="initialConfig">Initial Configuration Steps</h2>
      <p>Please fill out the following form to complete your installation.</p>
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <FormControl
            placeholder="First name"
            type="text"
            name="firstName"
            onChange={handleFirstName}
          />
        </FormGroup>
        <FormGroup>
          <FormControl
            placeholder="Last name"
            type="text"
            name="lastName"
            onChange={handleLastName}
          />
        </FormGroup>
        <p>
          Please input the best email address to use as your login and to
          receive emails from your installation such as notifications, alerts
          and other messages.
        </p>
        <FormGroup>
          <FormControl
            placeholder="Email"
            type="text"
            name="email"
            onChange={handleEmail}
          />
        </FormGroup>
        <FormGroup>
          <PasswordWithEye>
            <FormControl
              placeholder="Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              onChange={handlePassword}
            />

            <i
              onClick={toggleShowPassword}
              className={
                showPassword
                  ? 'icon-eye-slash showPassword'
                  : 'icon-eye showPassword'
              }
            />

            <div className="clearfix" />
          </PasswordWithEye>
        </FormGroup>
        <p>
          You must check below to receive information about upgrades and
          upgrading instructions, new tutorials, occasional requests for
          feedback and the monthly newsletter.{' '}
        </p>

        <FormGroup>
          <FormControl
            className="toggle-message"
            componentClass="checkbox"
            checked={subscribeEmail}
            onChange={toggleSubscribeEmail}
          >
            Yes, I want in. I know I can unsubscribe easily at any time.
          </FormControl>
        </FormGroup>
        <Button btnStyle="success" type="submit" block={true}>
          Save and continue to login
        </Button>
      </form>
    </AuthBox>
  );
};

export default OwnerSetup;
