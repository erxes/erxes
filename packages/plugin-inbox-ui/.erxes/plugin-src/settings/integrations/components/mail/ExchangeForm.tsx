import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { IFormProps } from '@erxes/ui/src/types';
import React from 'react';

type Props = {
  formProps: IFormProps;
};

function ExchangeForm({ formProps }: Props) {
  function renderField({
    label,
    type,
    name,
    required = true
  }: {
    label: string;
    type: string;
    name: string;
    required?: boolean;
  }) {
    return (
      <FormGroup>
        <ControlLabel required={required}>{label}</ControlLabel>
        <FormControl
          {...formProps}
          type={type}
          name={name}
          required={required}
        />
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
      {renderField({
        label: 'Password',
        type: 'password',
        name: 'password'
      })}
      {renderField({
        label: 'Username',
        type: 'text',
        name: 'username',
        required: false
      })}
      {renderField({
        label: 'Exchange server host',
        type: 'text',
        name: 'host'
      })}
    </>
  );
}

export default ExchangeForm;
