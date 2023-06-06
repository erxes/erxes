import { LoginFormWrapper, WithIconFormControl } from '../../styles/form';
import React, { useState } from 'react';

import { Config } from '../../types';
import Form from '../../common/form/Form';
import FormControl from '../../common/form/Control';
import FormGroup from '../../common/form/Group';
import { IButtonMutateProps } from '../../common/types';
import Icon from '../../common/Icon';
import { LOGIN_TYPES } from '../types';

type Props = {
  config: Config;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  hasCompany: boolean;
  setRegister: (value: boolean) => void;
  setLogin: (value: boolean) => void;
};

function Register({
  config,
  renderButton,
  hasCompany,
  setRegister,
  setLogin
}: Props) {
  const [type, changeType] = useState(LOGIN_TYPES.CUSTOMER);

  const onChange = e => {
    changeType(e.target.value);
    e.isDefaultPrevented();
  };

  const onSignin = () => {
    setRegister(false);
    setLogin(true);
  };

  const renderForm = formProps => {
    if (type === LOGIN_TYPES.CUSTOMER) {
      return (
        <>
          <FormGroup>
            <WithIconFormControl>
              <Icon icon="user" size={21} />
              <FormControl
                {...formProps}
                name="firstName"
                placeholder={'Enter your first name'}
                required={true}
              />
            </WithIconFormControl>
          </FormGroup>

          <FormGroup>
            <WithIconFormControl>
              <Icon icon="user-square" size={24} />
              <FormControl
                {...formProps}
                name="lastName"
                placeholder={'Enter your last name'}
                required={true}
              />
            </WithIconFormControl>
          </FormGroup>

          <FormGroup>
            <WithIconFormControl>
              <Icon icon="building" size={26} />
              <FormControl
                {...formProps}
                name="companyName"
                placeholder={'Enter your company name'}
                required={true}
              />
            </WithIconFormControl>
          </FormGroup>

          <FormGroup>
            <WithIconFormControl>
              <Icon icon="phone-alt" size={26} />
              <FormControl
                {...formProps}
                name="phone"
                placeholder={'Enter your phone number'}
              />
            </WithIconFormControl>
          </FormGroup>
        </>
      );
    }

    return (
      <>
        <FormGroup>
          <WithIconFormControl>
            <Icon icon="building" size={26} />
            <FormControl
              {...formProps}
              name="companyName"
              placeholder={'Enter your company name'}
              required={true}
            />
          </WithIconFormControl>
        </FormGroup>

        <FormGroup>
          <WithIconFormControl>
            <Icon icon="dialpad-alt" size={26} />
            <FormControl
              {...formProps}
              name="companyRegistrationNumber"
              placeholder={'Company registration number'}
              required={true}
              type="number"
            />
          </WithIconFormControl>
        </FormGroup>
      </>
    );
  };

  const renderContent = formProps => {
    const { values, isSubmitted } = formProps;

    return (
      <>
        {hasCompany && (
          <FormGroup>
            <FormControl componentClass="select" onChange={onChange}>
              <option value={LOGIN_TYPES.CUSTOMER}>Customer</option>
              <option value={LOGIN_TYPES.COMPANY}>Company</option>
            </FormControl>
          </FormGroup>
        )}

        {renderForm(formProps)}

        <FormGroup>
          <WithIconFormControl>
            <Icon icon="envelope-alt" size={26} />
            <FormControl
              {...formProps}
              name="email"
              placeholder={'Enter your email'}
              required={true}
            />
          </WithIconFormControl>
        </FormGroup>

        <FormGroup>
          <WithIconFormControl>
            <Icon icon="lock-alt" size={28} />
            <FormControl
              {...formProps}
              name="password"
              type="password"
              placeholder={'Enter your password'}
              required={true}
            />
          </WithIconFormControl>
        </FormGroup>

        <FormGroup>
          {renderButton({
            values: { ...values, type, clientPortalId: config._id },
            isSubmitted
          })}
        </FormGroup>

        <div className="auth-divider" />

        <div className="text-center">
          Already have an account?{' '}
          <span className="text-link" onClick={onSignin}>
            Sign in
          </span>
        </div>
      </>
    );
  };

  return (
    <LoginFormWrapper>
      <h2>{'Sign up'}</h2>
      <p>{'Free forever. No credit card needed'}</p>
      <Form renderContent={renderContent} />
    </LoginFormWrapper>
  );
}

export default Register;
