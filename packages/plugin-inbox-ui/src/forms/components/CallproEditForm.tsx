import FormControl from '@erxes/ui/src/components/form/Control';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';

import React from 'react';

interface IProps {
  integrationKind: string;
  details: any;
  onChange: (key: string, value: any) => void;
}

const IntegrationEditForm = (props: IProps) => {
  if (props.integrationKind !== 'callpro') {
    return null;
  }

  const onChange = (e: any) => {
    props.onChange(e.target.name, e.target.value);
  };

  return (
    <>
      <FormGroup>
        <ControlLabel required={false}>Phone number</ControlLabel>
        <FormControl
          name="phoneNumber"
          required={false}
          autoFocus={false}
          defaultValue={props.details.phoneNumber || ''}
          type="number"
          onChange={onChange}
        />
      </FormGroup>
      <FormGroup>
        <ControlLabel required={false}>Record Url</ControlLabel>
        <FormControl
          name="recordUrl"
          required={false}
          autoFocus={false}
          defaultValue={props.details.recordUrl || ''}
          onChange={onChange}
        />
      </FormGroup>
    </>
  );
};

export default IntegrationEditForm;
