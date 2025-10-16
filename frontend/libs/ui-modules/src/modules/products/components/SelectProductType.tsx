import { Form, Select } from 'erxes-ui';
import React from 'react';
import { PRODUCT_TYPES } from '../constants/productTypes';

export const SelectProductType = ({
  value,
  onValueChange,
  inForm = false,
}: {
  value: string;
  onValueChange: (value: string) => void;
  inForm?: boolean;
}) => {
  const Controller = inForm ? Form.Control : React.Fragment;
  return (
    <Select value={value} onValueChange={onValueChange}>
      <Controller>
        <Select.Trigger>
          <Select.Value placeholder="Choose Product Type" />
        </Select.Trigger>
      </Controller>
      <Select.Content>
        {PRODUCT_TYPES.map((type) => (
          <Select.Item key={type.value} value={type.value}>
            {type.label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};
