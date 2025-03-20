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
  groups: any[];

  closeModal: () => void;
  refetch?: () => void;
};

const GroupForm = (props: Props) => {
  const [doc, setDoc] = React.useState<any>(props.group || {});

  const renderContent = (formProps: IFormProps) => {
    return (
      <>
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
        <FormGroup>
          <ControlLabel>{__('code')}</ControlLabel>
          <FormControl
            {...formProps}
            id={'code'}
            name={'code'}
            type={'text'}
            required={true}
            defaultValue={doc.code}
            onChange={(e: any) => setDoc({ ...doc, code: e.target.value })}
          />
        </FormGroup>

        {props.groups.length > 0 && (
          <FormGroup>
            <ControlLabel>{__('Parent')}</ControlLabel>
            <FormControl
              {...formProps}
              name='parentId'
              componentclass='select'
              defaultValue={doc.parentId || null}
            >
              <option value='' />
              {props.groups
                .filter((g) => !g._id !== doc._id)
                .map((g) => {
                  return (
                    <option key={g._id} value={g._id}>
                      {g.label}
                    </option>
                  );
                })}
            </FormControl>
          </FormGroup>
        )}
        <ModalFooter>
          <Button
            btnStyle='simple'
            onClick={props.closeModal}
            icon='times-circle'
          >
            Close
          </Button>

          <Button
            btnStyle='primary'
            icon='save'
            onClick={() => {
              console.log(doc);
            }}
          >
            Save
          </Button>
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default GroupForm;
