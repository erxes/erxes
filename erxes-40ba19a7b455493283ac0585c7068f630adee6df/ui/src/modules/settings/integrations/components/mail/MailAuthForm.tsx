import FormControl from 'modules/common/components/form/Control';
import FormGroup from 'modules/common/components/form/Group';
import ControlLabel from 'modules/common/components/form/Label';
import { IFormProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import React from 'react';

type Props = {
  kind: string;
  formProps: IFormProps;
};

function MailAuthForm({ kind, formProps }: Props) {
  function renderDescription() {
    if (kind !== 'nylas-yahoo') {
      return null;
    }

    return (
      <p>
        {__('In order to connect Yahoo, you  should generate the app password')}{' '}
        <a href="https://login.yahoo.com/account/security">
          Click here to generate password for erxes
        </a>
      </p>
    );
  }

  function renderField({
    label,
    type,
    name
  }: {
    label: string;
    type: string;
    name: string;
  }) {
    return (
      <FormGroup>
        <ControlLabel required={true}>{label}</ControlLabel>
        <FormControl {...formProps} type={type} name={name} required={true} />
      </FormGroup>
    );
  }

  return (
    <>
      {renderField({
        label: 'Email',
        type: 'email',
        name: 'email'
      })}

      {renderDescription()}

      {renderField({
        label: 'Password',
        type: 'password',
        name: 'password'
      })}
    </>
  );
}

export default MailAuthForm;
