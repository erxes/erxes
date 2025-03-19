import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import React from 'react';

import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils/core';

type Props = {
  group?: any;
};

const GroupForm = (props: Props) => {
  const [doc, setDoc] = React.useState<any>(props.group || {});

  const renderContent = (formProps: IFormProps) => {
    return (
      <FormGroup>
        <ControlLabel>{__('Label')}</ControlLabel>
        <FormControl
          {...formProps}
          id={'label'}
          name={'label'}
          type={'text'}
          required={true}
          defaultValue={doc.label}
          onChange={(e: any) => setDoc({ ...doc, label: e.target.value })}
        />
      </FormGroup>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default GroupForm;
