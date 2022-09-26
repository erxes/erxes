import React from 'react';
import Field from './Field';

export default function GenerateFields({
  fields,
  customFieldsData,
  setCustomFieldsData
}) {
  const onChangeCustomFields = (fieldId: string, value: any) => {
    let updatedCustomFieldsData = customFieldsData.filter(
      f => f.field !== fieldId
    );

    updatedCustomFieldsData.push({ field: fieldId, value });

    setCustomFieldsData(updatedCustomFieldsData);
  };

  return fields.map((f, index) => (
    <Field
      key={index}
      customFieldsData={customFieldsData}
      field={f}
      onChange={onChangeCustomFields}
    />
  ));
}
