import { AddContent, AddRow } from '../../styles/item';

import AssignedUsers from './AssignedUsers';
import GenerateField from '@erxes/ui-forms/src/settings/properties/components/GenerateField';
import { IField } from '@erxes/ui/src/types';
import { LogicParams } from '@erxes/ui-forms/src/settings/properties/types';
import PipelineLabels from './PipelineLabels';
import React from 'react';
import { checkLogic } from '@erxes/ui-forms/src/settings/properties/utils';

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

    // check nested logics and clear field value
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

            const object = props.object || {};

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

        return (
          <AddRow key={index}>
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
