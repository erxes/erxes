import Button from 'modules/common/components/Button';
import { FormControl, FormGroup } from 'modules/common/components/form';
import React from 'react';
import { useState } from 'react';
import { AuthBox } from '../styles';

type Props = {
  createOwner: (arg: any) => void;
};

const OwnerSetup = (props: Props) => {
  const { createOwner } = props;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const handleSubmit = e => {
    e.preventDefault();

    createOwner({
      email,
      password,
      passwordConfirmation
    });
  };

  const handleEmail = e => {
    e.preventDefault();

    setEmail(e.target.value);
  };

  const handlePassword = e => {
    e.preventDefault();

    setPassword(e.target.value);
  };

  const handlePasswordConfirmation = e => {
    e.preventDefault();

    setPasswordConfirmation(e.target.value);
  };

  return (
    <AuthBox>
      <h2>Owner setup</h2>
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <FormControl
            placeholder="Email"
            type="text"
            required={true}
            name="email"
            onChange={handleEmail}
          />

          <FormControl
            placeholder="Password"
            type="password"
            required={true}
            name="password"
            onChange={handlePassword}
          />

          <FormControl
            placeholder="Password confirmation"
            type="password"
            required={true}
            name="passwordConfirmation"
            onChange={handlePasswordConfirmation}
          />
        </FormGroup>
        <Button btnStyle="success" type="submit" block={true}>
          Save
        </Button>
      </form>
    </AuthBox>
  );
};

export default OwnerSetup;
