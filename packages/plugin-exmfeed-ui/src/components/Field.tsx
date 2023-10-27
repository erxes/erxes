import FormControl from '@erxes/ui/src/components/form/Control';
import React from 'react';
import Select from 'react-select-plus';

type Props = {
  field: any;
  customFieldsData: any;
  onChange: any;
};

export default function Field({ field, customFieldsData, onChange }: Props) {
  const fieldData = customFieldsData.find(f => f.field === field._id) || {};

  if (field.type === 'select') {
    const onChangeSelect = selected => {
      onChange(field._id, selected.value);
    };

    return (
      <Select
        placeholder={field.text}
        value={fieldData.value}
        onChange={onChangeSelect}
        options={field.options.map(f => ({ value: f, label: f }))}
      />
    );
  }

  if (field.type === 'multiSelect') {
    const onChangeSelect = selectedOptions => {
      onChange(
        field._id,
        selectedOptions.map(option => option.value)
      );
    };

    return (
      <Select
        placeholder={field.text}
        value={fieldData.value}
        onChange={onChangeSelect}
        multi={true}
        options={field.options.map(f => ({ value: f, label: f }))}
      />
    );
  }

  if (field.type === 'input') {
    const onChangeInput = e => {
      onChange(field._id, e.target.value);
    };

    return (
      <FormControl
        placeholder={field.text}
        type="text"
        name={field.name}
        defaultValue={fieldData.value}
        onChange={onChangeInput}
      />
    );
  }

  if (field.type === 'textarea') {
    const onChangeTextArea = e => {
      onChange(field._id, e.target.value);
    };

    return (
      <FormControl
        placeholder={field.text}
        type="text"
        componentClass="textarea"
        defaultValue={fieldData.value}
        onChange={onChangeTextArea}
      />
    );
  }

  return <div></div>;
}
