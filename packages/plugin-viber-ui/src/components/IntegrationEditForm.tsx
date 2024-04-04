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
  if (props.integrationKind !== 'viber') {
    return null;
  }

  const onChange = (e: any) => {
    props.onChange(e.target.name, e.target.value);
  };

  return (
    <>
      <FormGroup>
        <ControlLabel required={false}>Token</ControlLabel>
        <FormControl
          name="token"
          required={false}
          autoFocus={false}
          defaultValue={props.details.token || ''}
          onChange={onChange}
        />
      </FormGroup>
    </>
  );
};

export default IntegrationEditForm;
