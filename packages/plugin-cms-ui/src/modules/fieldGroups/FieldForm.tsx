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
import { mutations } from './graphql';
import { queries as formQueries } from '@erxes/ui-forms/src/settings/properties/graphql';
import { stringToRegex } from '@erxes/ui-forms/src/settings/properties/utils';

type Props = {
  groupId: string;
  groups: any[];
  field?: IField;

  closeModal: () => void;
  refetch?: () => void;
};

const FieldForm = (props: Props) => {
  const { groups, field } = props;
  const [doc, setDoc] = React.useState<any>(props.field || {});
  const [add] = useMutation(mutations.ADD_FIELD);
  const [edit] = useMutation(mutations.EDIT_FIELD);

  const [inputType, setInputType] = React.useState('input');
  const [validation, setValidation] = React.useState('');
  const [regexValidation, setRegexValidation] = React.useState('');

  const { data, loading: typesLoading } = useQuery(
    gql(formQueries.getFieldsInputTypes)
  );

  const onChangeRegex = (e: any) => {
    if (e.target.value.length === 0) {
      // this.setState({ regexValidation: "" });
      setRegexValidation('');
      return;
    }

    const regexValidation = stringToRegex(e.target.value);
    setRegexValidation(regexValidation);
  };

  const renderContent = (formProps: IFormProps) => {
    const submit = () => {
      const keysToDelete = ['_id', '__typename', 'createdAt'];

      const variables: any = {
        groupId: props.groupId,
        contentType: 'cms:post',
        type: inputType,
        validation,
        regexValidation,
      };

      

      Object.keys(doc).forEach((key) => {
        if (keysToDelete.indexOf(key) === -1) {
          variables[key] = doc[key];
        }
      });

      if (field) {
        variables._id = field._id;
      }

      

      if (field) {
        edit({
          variables,
        }).then(() => {
          props.refetch?.();
        });
      } else {
        add({
          variables,
        }).then(() => {
          props.refetch?.();
        });
      }

      props.closeModal();
    };

    return (
      <>
        <FormGroup>
          <ControlLabel>{__('Label')}</ControlLabel>
          <FormControl
            {...formProps}
            id={'text'}
            name={'text'}
            type={'text'}
            required={true}
            defaultValue={field?.text}
            onChange={(e: any) => setDoc({ ...doc, text: e.target.value })}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Description:</ControlLabel>
          <FormControl
            {...formProps}
            name='description'
            componentclass='textarea'
            defaultValue={field?.description || ''}
            onChange={(e: any) => setDoc({ ...doc, description: e.target.value })}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>{__('Key')}</ControlLabel>
          <FormControl
            {...formProps}
            id={'code'}
            name={'code'}
            type={'text'}
            required={true}
            defaultValue={field?.code}
            onChange={(e: any) => setDoc({ ...doc, code: e.target.value })}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>{__('Group')}</ControlLabel>
          <FormControl
            {...formProps}
            name='groupId'
            componentclass='select'
            defaultValue={props.groupId || field?.groupId}
            onChange={(e: any) => setDoc({ ...doc, groupId: e.target.value })}
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
              {data?.getFieldsInputTypes?.map((inputType, index) => {
                return (
                  <option value={inputType.value} key={index}>
                    {inputType.label}
                  </option>
                );
              })}
            </FormControl>
          </FormGroup>
        )}

        {inputType === 'input' && (
          <FormGroup>
            <ControlLabel>Validation:</ControlLabel>
            <FormControl
              {...formProps}
              componentclass='select'
              name='validation'
              defaultValue={props.field?.validation || ''}
              onChange={(e: any) => {
                setDoc({ ...doc, validation: e.target.value });
              
              }}
            >
              <option />
              <option value='email'>Email</option>
              <option value='number'>Number</option>
              <option value='date'>Date</option>
              <option value='datetime'>Date Time</option>
              <option value='regex'>Regular Expression</option>
            </FormControl>
          </FormGroup>
        )}

        {validation === 'regex' && (
          <FormGroup>
            <ControlLabel htmlFor='validation'>
              Regular Expression:
            </ControlLabel>
            <p>{__('Setup regular expression')}</p>

            <FormControl
              id='regex'
              placeholder='Enter sample text here'
              componentclass='input'
              onChange={onChangeRegex}
            />
            {regexValidation && <p>RegexPattern: {regexValidation || ''}</p>}
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

          <Button btnStyle='success' type='submit' icon='save' onClick={submit}>
            Save
          </Button>
        </ModalFooter>
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default FieldForm;
