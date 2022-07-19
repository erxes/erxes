import GenerateField from '@erxes/ui-settings/src/properties/components/GenerateField';
import { IField } from '@erxes/ui/src/types';
import React from 'react';
import { AddContent, AddRow } from '../../styles/item';
import AssignedUsers from './AssignedUsers';
import PipelineLabels from './PipelineLabels';

type Props = {
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
