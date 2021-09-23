import React from 'react';
import Select from 'react-select-plus';

type Props = {
  field: any;
  customFieldsData: any;
  onChange: any;
};

export default function Field({ field, customFieldsData, onChange }: Props) {
  if (field.type === 'select') {
    const onChangeSelect = selected => {
      onChange(field._id, selected.value);
    };

    const fieldData = customFieldsData.find(f => f.field === field._id) || {};

    return (
      <Select
        placeholder={field.text}
        value={fieldData.value}
        onChange={onChangeSelect}
        options={field.options.map(f => ({ value: f, label: f }))}
      />
    );
  }

  return <div></div>;
}
