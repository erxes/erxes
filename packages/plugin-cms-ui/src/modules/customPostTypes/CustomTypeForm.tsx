import { IFormProps } from '@erxes/ui/src/types';
import React from 'react';

import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils/core';
import { useMutation } from '@apollo/client';
import mutations from './graphql/mutations';

type Props = {
  clientPortalId: string;

  postType?: any;

  closeModal: () => void;
  refetch?: () => void;
};

const CustomTypeForm = (props: Props) => {
  const [doc, setDoc] = React.useState<any>(props.postType || {});
  const [add] = useMutation(mutations.ADD);
  const [edit] = useMutation(mutations.EDIT);
  const { postType, clientPortalId, closeModal, refetch } = props;

  const renderContent = (formProps: IFormProps) => {
    const submit = () => {
      const keysToDelete = ['_id', '__typename', 'createdAt'];

      const input: any = {
        clientPortalId,
      };

      Object.keys(doc).forEach((key) => {
        if (keysToDelete.indexOf(key) === -1) {
          input[key] = doc[key];
        }
      });

      if (postType) {
        edit({
          variables: {
            id: postType._id,
            input,
          },
        }).then(() => {
          if (refetch) {
            refetch();
          }
        });
      } else {
        add({
          variables: {
            input,
          },
        }).then(() => {
          if (refetch) {
            refetch();
          }
        });
      }
      props.closeModal();
    };

    return (
      <>
        <FormGroup>
          <ControlLabel required>{__('Label')}</ControlLabel>
          <FormControl
            {...formProps}
            id={'label'}
            name={'label'}
            type={'text'}
            required={true}
            defaultValue={postType?.label}
            onChange={(e: any) => setDoc({ ...doc, label: e.target.value })}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required>{__('Plural Label')}</ControlLabel>
          <FormControl
            {...formProps}
            id={'pluralLabel'}
            name={'pluralLabel'}
            type={'text'}
            required={true}
            defaultValue={postType?.pluralLabel}
            onChange={(e: any) => setDoc({ ...doc, pluralLabel: e.target.value })}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Description:</ControlLabel>
          <FormControl
            {...formProps}
            name='description'
            componentclass='textarea'
            defaultValue={postType?.description || ''}
            onChange={(e: any) => setDoc({ ...doc, description: e.target.value })}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel required>{__('Key')}</ControlLabel>
          <FormControl
            {...formProps}
            id={'code'}
            name={'code'}
            type={'text'}
            required={true}
            defaultValue={postType?.code}
            onChange={(e: any) => setDoc({ ...doc, code: e.target.value })}
          />
        </FormGroup>

        <ModalFooter>
          <Button
            btnStyle='simple'
            onClick={props.closeModal}
            icon='times-circle'
          >
            Close
          </Button>

          <Button
            btnStyle='success'
            icon='save'
            onClick={() => {
              submit();
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

export default CustomTypeForm;
