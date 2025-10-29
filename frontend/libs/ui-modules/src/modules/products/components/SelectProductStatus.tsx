import React from 'react';
import { PRODUCT_STATUSES } from '../constants/productStatuses';
import { Form, Select } from 'erxes-ui';

export const SelectProductStatus = ({
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
          <Select.Value placeholder="Select status" />
        </Select.Trigger>
      </Controller>
      <Select.Content>
        {PRODUCT_STATUSES.map((status) => (
          <Select.Item key={status} value={status}>
            {status}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};
