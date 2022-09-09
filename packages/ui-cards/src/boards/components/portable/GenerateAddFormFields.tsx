import GenerateField from '@erxes/ui-forms/src/settings/properties/components/GenerateField';
import { LogicParams } from '@erxes/ui-forms/src/settings/properties/types';
import { checkLogic } from '@erxes/ui-forms/src/settings/properties/utils';
import { IField } from '@erxes/ui/src/types';
import React from 'react';

import { AddContent, AddRow } from '../../styles/item';
import AssignedUsers from './AssignedUsers';
import PipelineLabels from './PipelineLabels';

type Props = {
  object: any;
  fields: IField[];
  customFieldsData: any;
  onChangeField: (name: any, value: any) => void;
  pipelineId: string;
};

function GenerateAddFormFields(props: Props) {
  const customFields = props.fields.filter(f => !f.isDefinedByErxes);
  const fields = props.fields.filter(f => f.isDefinedByErxes);

  const { customFieldsData, onChangeField } = props;

  const onCustomFieldsDataChange = ({ _id, value }) => {
    const field = customFieldsData.find(c => c.field === _id);

    if (field) {
      field.value = value;

      onChangeField('customFieldsData', customFieldsData);
    } else {
      onChangeField('customFieldsData', [
        ...customFieldsData,
        { field: _id, value }
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
                pipelineId={props.pipelineId}
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
              fieldValue: props.object[logic.fieldId || ''],
              validation: fields.find(e => e._id === fieldId)?.validation,
              type: field.type
            };
          });

          if (!checkLogic(logics)) {
            return null;
          }
        }
        return (
          <AddRow>
            <AddContent>
              <GenerateField
                field={field}
                key={index}
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

export default GenerateAddFormFields;
