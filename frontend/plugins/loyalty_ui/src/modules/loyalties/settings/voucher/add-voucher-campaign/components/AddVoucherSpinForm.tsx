import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form, Input, Select } from 'erxes-ui';
import { VoucherFormValues } from '../../constants/voucherFormSchema';
import { VOUCHER_SPIN_DATA } from '../constants/voucherSpinData';

interface AddVoucherSpinFormProps {
  form: UseFormReturn<VoucherFormValues>;
}

export const AddVoucherSpinForm: React.FC<AddVoucherSpinFormProps> = ({
  form,
}) => {
  return (
    <div className="space-y-4 p-5">
      <Form.Field
        control={form.control}
        name="spinCampaignId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Spin</Form.Label>
            <Form.Control>
              <Select onValueChange={field.onChange} value={field.value}>
                <Select.Trigger
                  className={field.value ? '' : 'text-muted-foreground'}
                >
                  {VOUCHER_SPIN_DATA.find((type) => type.value === field.value)
                    ?.label || 'Select spin'}
                </Select.Trigger>
                <Select.Content>
                  {VOUCHER_SPIN_DATA.map((option) => (
                    <Select.Item key={option.value} value={option.value}>
                      {option.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select>
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="spinCount"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Spin Count</Form.Label>
            <Form.Control>
              <Input
                type="text"
                placeholder="Enter spin count"
                {...field}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = Number(value);
                  field.onChange(Number.isNaN(numValue) ? 0 : numValue);
                }}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
