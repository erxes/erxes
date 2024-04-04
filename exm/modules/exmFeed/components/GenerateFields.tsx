import Field from "./Field";
import React from "react";

export default function GenerateFields({
  fields,
  customFieldsData,
  setCustomFieldsData,
}) {
  const onChangeCustomFields = (fieldId: string, value: any) => {
    const updatedCustomFieldsData = customFieldsData.filter(
      (f) => f.field !== fieldId
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
