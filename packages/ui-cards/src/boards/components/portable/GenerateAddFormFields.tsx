import GenerateField from '@erxes/ui-settings/src/properties/components/GenerateField';
import { IField } from '@erxes/ui/src/types';
import React from 'react';
import { HeaderContent, HeaderRow } from '../../styles/item';

type Props = {
  fields: IField[];
  customFieldsData: any;
  onChangeField: (name: any, value: any) => void;
};

function GenerateAddFormFields(props: Props) {
  const customFields = props.fields.filter(f => !f.isDefinedByErxes);
  const fields = props.fields.filter(f => f.isDefinedByErxes);

  const { customFieldsData } = props;

  const onCustomFieldsDataChange = ({ _id, value }) => {
    const field = customFieldsData.find(c => c.field === _id);

    if (field) {
      field.value = value;

      props.onChangeField('customFieldsData', customFieldsData);
    } else {
      props.onChangeField('customFieldsData', [
        ...customFieldsData,
        { field: _id, value }
      ]);
    }
  };

  const onFieldsDataChange = ({ _id, value }) => {
    const field = fields.find(c => c._id === _id);

    if (field && field.field) {
      props.onChangeField(field.field, value);
    }
  };

  return (
    <>
      {fields.map((field, index) => {
        return (
          <HeaderRow>
            <HeaderContent>
              <GenerateField
                field={field}
                key={index}
                onValueChange={onFieldsDataChange}
                isEditing={true}
              />
            </HeaderContent>
          </HeaderRow>
        );
      })}
      {customFields.map((field, index) => {
        return (
          <HeaderRow>
            <HeaderContent>
              <GenerateField
                field={field}
                key={index}
                onValueChange={onCustomFieldsDataChange}
                isEditing={true}
              />
            </HeaderContent>
          </HeaderRow>
        );
      })}
    </>
  );
}

export default GenerateAddFormFields;
