import client from '@erxes/ui/src/apolloClient';
import Select from "react-select";
// import { FIELDS_GROUPS_CONTENT_TYPES } from "@erxes/ui-forms/src/settings/properties/constants";
import React, { useEffect, useState } from 'react';
import {
  Button,
  ControlLabel,
  Form,
  FormControl,
  FormGroup
} from '@erxes/ui/src/components';
import { gql } from '@apollo/client';
import { IButtonMutateProps, IFormProps } from '@erxes/ui/src/types';
import { IFieldGroup } from '@erxes/ui-forms/src/settings/properties/types';
import { isEnabled } from '@erxes/ui/src/utils/core';
import { ISyncRule } from '../types';
import { ModalFooter } from '@erxes/ui/src/styles/main';
import { queries as fieldQueries } from '@erxes/ui-forms/src/settings/properties/graphql';

const FIELDS_GROUPS_CONTENT_TYPES = {
  CUSTOMER: 'core:customer',
  COMPANY: 'core:company',
  DEAL: 'sales:deal'
};


type Props = {
  syncRule?: ISyncRule;
  closeModal?: () => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  afterSave?: () => void;
  modal?: boolean;
  extended?: boolean;
};

const SyncRuleForm = (props: Props) => {
  const { syncRule, closeModal, renderButton, afterSave } = props;
  const object = syncRule || ({} as ISyncRule);

  const [fieldGroups, setFieldGroups] = useState<IFieldGroup[]>([]);
  const [objectType, setObjectType] = useState<string>(syncRule?.objectType || FIELDS_GROUPS_CONTENT_TYPES.CUSTOMER)
  const [fieldGroup, setFieldGroup] = useState<string>(syncRule?.fieldGroup || '')
  const [formField, setFormField] = useState<string>(syncRule?.formField || '')

  useEffect(() => {
    client
      .query({
        query: gql(fieldQueries.fieldsGroups),
        variables: {
          contentType: objectType,
        },
      })
      .then(({ data }) => {
        setFieldGroups(data ? data.fieldsGroups : [] || []);
      });
  }, [objectType]);

  const renderFooter = (formProps: IFormProps) => {
    const { values, isSubmitted } = formProps;

    if (syncRule) {
      values._id = syncRule._id;
    }

    const updatedValues = {
      ...values,
      objectType,
      fieldGroup,
      formField
    }

    return (
      <ModalFooter>
        <Button
          btnStyle="simple"
          type="button"
          icon="times-circle"
          onClick={closeModal}
        >
          Cancel
        </Button>

        {renderButton({
          name: 'syncRule',
          values: updatedValues,
          isSubmitted,
          callback: closeModal || afterSave,
          object: syncRule
        })}
      </ModalFooter>
    );
  };

  const renderContent = (formProps: IFormProps) => {
    return (
      <>
        <FormGroup>
          <ControlLabel required={true}>Service Name</ControlLabel>
          <FormControl
            {...formProps}
            name="serviceName"
            defaultValue={object.serviceName}
            required={true}
            autoFocus={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Response Key</ControlLabel>
          <FormControl
            {...formProps}
            name="responseKey"
            defaultValue={object.responseKey}
            required={true}
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel required={true}>Object Type</ControlLabel>
          <FormControl
            componentclass="select"
            value={objectType}
            options={Object.keys(FIELDS_GROUPS_CONTENT_TYPES).map(key => ({
              value: FIELDS_GROUPS_CONTENT_TYPES[key],
              label: key
            }))}
            onChange={(e) =>
              setObjectType((e.target as any).value)
            }
          />
        </FormGroup>

        <FormGroup>
          <ControlLabel>Field Group</ControlLabel>
          <FormControl
            {...formProps}
            name="fieldGroup"
            componentclass="select"
            options={[
              { value: "", label: "Empty" },
              ...(fieldGroups || []).map((fg) => ({
                value: fg._id,
                label: `${fg.code} - ${fg.name}`,
              })),
            ]}
            value={fieldGroup}
            onChange={(e) => setFieldGroup((e.target as any).value)}
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>Field</ControlLabel>
          <FormControl
            {...formProps}
            name="formField"
            componentclass="select"
            options={[
              { value: "", label: "Empty" },
              ...(
                (
                  (
                    (fieldGroups || []).find(
                      (fg) => fg._id === fieldGroup
                    ) || {}
                  ).fields || []
                ) || []
              ).map((f) => ({
                value: f._id,
                label: `${f.code} - ${f.text}`,
              })),
            ]}
            value={formField}
            onChange={(e) => setFormField((e.target as any).value)}
          />
        </FormGroup>

        {renderFooter({ ...formProps })}
      </>
    );
  };

  return <Form renderContent={renderContent} />;
};

export default SyncRuleForm;
