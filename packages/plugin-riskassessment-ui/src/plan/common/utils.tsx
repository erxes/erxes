import { gql, useQuery } from '@apollo/client';
import { AddContent, AddRow } from '@erxes/ui-cards/src/boards//styles/item';
import AssignedUsers from '@erxes/ui-cards/src/boards/components/portable/AssignedUsers';
import PipelineLabels from '@erxes/ui-cards/src/boards/components/portable/PipelineLabels';
import { queries as formQueries } from '@erxes/ui-forms/src/forms/graphql';
import GenerateField from '@erxes/ui-forms/src/settings/properties/components/GenerateField';
import { LogicParams } from '@erxes/ui-forms/src/settings/properties/types';
import { checkLogic } from '@erxes/ui-forms/src/settings/properties/utils';
import { ControlLabel, FormGroup, Spinner, __ } from '@erxes/ui/src';
import SelectBranches from '@erxes/ui/src/team/containers/SelectBranches';
import SelectDepartments from '@erxes/ui/src/team/containers/SelectDepartments';
import React from 'react';
import { SelectOperations } from '../../common/utils';
import { DetailPopOver } from '../../assessments/common/utils';
import { Attributes } from '@erxes/ui-automations/src/components/forms/actions/styles';
// import { CARD_ATTRIBUTE_TYPES } from './constants';

const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

export function CardCustomFields({
  type,
  pipelineId,
  onChangeField,
  customFieldsData,
  object
}) {
  const { data, loading } = useQuery(gql(formQueries.fields), {
    variables: {
      contentType: `cards:${type}`,
      isVisibleToCreate: true,
      pipelineId
    }
  });

  if (loading) {
    return <Spinner />;
  }
  const customFields = data.fields.filter(f => !f.isDefinedByErxes);
  const fields = data.fields.filter(f => f.isDefinedByErxes);

  const onCustomFieldsDataChange = ({
    _id,
    value,
    extraValue
  }: {
    _id: string;
    value: any;
    extraValue?: string;
  }) => {
    const field = customFieldsData.find(c => c.field === _id);

    //check nested logics and clear field value
    for (const f of customFields) {
      const logics = f.logics || [];

      if (!logics.length) {
        continue;
      }

      if (logics.findIndex(l => l.fieldId && l.fieldId.includes(_id)) === -1) {
        continue;
      }

      customFieldsData.forEach(c => {
        if (c.field === f._id) {
          c.value = '';
        }
      });
    }

    if (field) {
      field.value = value;
      if (extraValue) {
        field.extraValue = extraValue;
      }

      onChangeField('customFieldsData', customFieldsData);
    } else {
      onChangeField('customFieldsData', [
        ...customFieldsData,
        { field: _id, value, extraValue }
      ]);
    }
  };

  const onFieldsDataChange = ({ _id, value }) => {
    const field = fields.find(c => c._id === _id);

    if (field && field.field) {
      onChangeField(field.field, value);
    }
  };

  return (
    <>
      {fields.map((field, index) => {
        const renderField = () => {
          if (field.field === 'labelIds') {
            return (
              <PipelineLabels
                field={field}
                pipelineId={pipelineId}
                onChangeField={onChangeField}
              />
            );
          }

          if (field.field === 'assignedUserIds') {
            return (
              <AssignedUsers field={field} onChangeField={onChangeField} />
            );
          }

          return (
            <GenerateField
              field={field}
              key={index}
              onValueChange={onFieldsDataChange}
              isEditing={true}
            />
          );
        };

        return (
          <AddRow key={index}>
            <AddContent>{renderField()}</AddContent>
          </AddRow>
        );
      })}

      {customFields.map((field, index) => {
        if (field.logics && field.logics.length > 0) {
          const data = {};

          customFieldsData.forEach(f => {
            data[f.field] = f.value;
          });

          const logics: LogicParams[] = field.logics.map(logic => {
            let { fieldId = '' } = logic;

            if (fieldId.includes('customFieldsData')) {
              fieldId = fieldId.split('.')[1];
              return {
                fieldId,
                operator: logic.logicOperator,
                validation: fields.find(e => e._id === fieldId)?.validation,
                logicValue: logic.logicValue,
                fieldValue: data[fieldId],
                type: field.type
              };
            }

            return {
              fieldId,
              operator: logic.logicOperator,
              logicValue: logic.logicValue,
              fieldValue: object[logic.fieldId || ''] || '',
              validation: fields.find(e => e._id === fieldId)?.validation,
              type: field.type
            };
          });

          if (!checkLogic(logics)) {
            return null;
          }
        }

        const defaultValue = customFieldsData.find(
          customFieldData => customFieldData.field === field._id
        )?.value;

        return (
          <AddRow key={index}>
            <AddContent>
              <GenerateField
                field={field}
                key={index}
                defaultValue={defaultValue}
                onValueChange={onCustomFieldsDataChange}
                isEditing={true}
              />
            </AddContent>
          </AddRow>
        );
      })}
    </>
  );
}

export function SelectStructure({
  structureType,
  name,
  structureTypeIds,
  structureTypeId,
  filter,
  onChange,
  multi,
  label
}: {
  structureType: string;
  structureTypeIds?: string[];
  structureTypeId?: string;
  name: string;
  label?: string;
  filter?: any;
  onChange: (value, name) => void;
  multi?: boolean;
}) {
  const content = () => {
    switch (structureType) {
      case 'branch':
        return (
          <SelectBranches
            label={`Select ${label || ''} Branch`}
            name={name}
            filterParams={filter}
            initialValue={structureTypeIds || structureTypeId}
            onSelect={onChange}
            multi={!!multi}
          />
        );
      case 'department':
        return (
          <SelectDepartments
            label={`Select ${label || ''} Department`}
            name={name}
            filterParams={filter}
            initialValue={structureTypeIds || structureTypeId}
            onSelect={onChange}
            multi={!!multi}
          />
        );
      case 'operation':
        return (
          <SelectOperations
            label={`Select ${label || ''} Operation`}
            name={name}
            filterParams={filter}
            initialValue={structureTypeIds || structureTypeId}
            onSelect={onChange}
            multi={!!multi}
          />
        );

      default:
        return null;
    }
  };

  return (
    <FormGroup>
      <ControlLabel>{capitalize(structureType)}</ControlLabel>
      {content()}
    </FormGroup>
  );
}
