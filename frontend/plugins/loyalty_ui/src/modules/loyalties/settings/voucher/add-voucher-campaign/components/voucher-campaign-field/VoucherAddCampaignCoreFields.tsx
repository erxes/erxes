import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form, Input, Select } from 'erxes-ui';
import { VoucherFormValues } from '../../../constants/voucherFormSchema';
import { VOUCHER_TYPES } from '../../constants/voucherTypeData';
import { VOUCHER_KIND_TYPES } from '../../constants/voucherKindTypeData';

interface VoucherAddCampaignCoreFieldsProps {
  form: UseFormReturn<VoucherFormValues>;
}

export const VoucherAddCampaignCoreFields: React.FC<
  VoucherAddCampaignCoreFieldsProps
> = ({ form }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="flex flex-col gap-2">
        <Form.Field
          control={form.control}
          name="title"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Title</Form.Label>
              <Form.Control>
                <Input placeholder="Enter voucher title" {...field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="type"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Type</Form.Label>
              <Form.Control>
                <Select onValueChange={field.onChange} value={field.value}>
                  <Select.Trigger
                    className={field.value ? '' : 'text-muted-foreground'}
                  >
                    {VOUCHER_TYPES.find((type) => type.value === field.value)
                      ?.label || 'Select type'}
                  </Select.Trigger>
                  <Select.Content>
                    {VOUCHER_TYPES.map((option) => (
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
          name="count"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Count</Form.Label>
              <Form.Control>
                <Input
                  type="text"
                  placeholder="Enter count"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Form.Field
          control={form.control}
          name="buyScore"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Buy Score</Form.Label>
              <Form.Control>
                <Input
                  type="text"
                  placeholder="Enter voucher buy score"
                  {...field}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
        <Form.Field
          control={form.control}
          name="kind"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Kind</Form.Label>
              <Form.Control>
                <Select onValueChange={field.onChange} value={field.value}>
                  <Select.Trigger
                    className={field.value ? '' : 'text-muted-foreground'}
                  >
                    {VOUCHER_KIND_TYPES.find(
                      (type) => type.value === field.value,
                    )?.label || 'Select kind'}
                  </Select.Trigger>
                  <Select.Content>
                    {VOUCHER_KIND_TYPES.map((option) => (
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
      </div>
    </div>
  );
};
