import { IField, IFormProps } from '@erxes/ui/src/types';
import React from 'react';

import { gql, useMutation, useQuery } from '@apollo/client';
import Button from '@erxes/ui/src/components/Button';
import FormControl from '@erxes/ui/src/components/form/Control';
import Form from '@erxes/ui/src/components/form/Form';
import FormGroup from '@erxes/ui/src/components/form/Group';
import ControlLabel from '@erxes/ui/src/components/form/Label';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { __ } from '@erxes/ui/src/utils/core';
import { mutations } from '../graphql';
import { queries as formQueries } from '@erxes/ui-forms/src/settings/properties/graphql';

type Props = {
  groupId: string;
  groups: any[];
  field?: IField;

  closeModal: () => void;
  refetch?: () => void;
};

const FieldForm = (props: Props) => {
  const { groups, field } = props;
  const [inputType, setInputType] = React.useState('input');

  const { data, loading: typesLoading } = useQuery(
    gql(formQueries.getFieldsInputTypes)
  );

  const renderContent = (formProps: IFormProps) => {
    const { values } = formProps;

    const submit = () => {
      props.refetch?.();
      props.closeModal();
    };

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
            defaultValue={field?.text}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Description:</ControlLabel>
          <FormControl
            {...formProps}
            name='description'
            componentclass='textarea'
            defaultValue={field?.description || ''}
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
            defaultValue={field?.code}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__('Group')}</ControlLabel>
          <FormControl
            {...formProps}
            name='groupId'
            componentclass='select'
            defaultValue={props.groupId || field?.groupId}
          >
            <option value='' />
            {groups.map((g) => {
              return (
                <option key={g._id} value={g._id}>
                  {g.label}
                </option>
              );
            })}
          </FormControl>
        </FormGroup>

        {!typesLoading && (
          <FormGroup>
            <ControlLabel required={true}>Type:</ControlLabel>

            <FormControl
              {...formProps}
              name='type'
              componentclass='select'
              value={inputType}
              onChange={(e: any) => setInputType(e.target.value)}
              required={true}
            >
              <option />
              {data?.getFieldsInputTypes?.map((inputType) => {
                return (
                  <option value={inputType.value} key={Math.random()}>
                    {inputType.label}
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

export default FieldForm;
