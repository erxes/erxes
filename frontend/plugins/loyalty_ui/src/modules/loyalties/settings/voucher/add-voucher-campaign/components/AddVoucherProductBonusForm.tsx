import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form, Input } from 'erxes-ui';
import { VoucherFormValues } from '../../constants/voucherFormSchema';
import { SelectProduct } from 'ui-modules';

interface AddVoucherProductBonusFormProps {
  form: UseFormReturn<VoucherFormValues>;
}

export const AddVoucherProductBonusForm: React.FC<
  AddVoucherProductBonusFormProps
> = ({ form }) => {
  return (
    <div className="space-y-4 p-5">
      <Form.Field
        control={form.control}
        name="bonusProduct"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Bonus Product</Form.Label>
            <Form.Control>
              <SelectProduct
                value={field.value}
                onValueChange={(value) =>
                  field.onChange(Array.isArray(value) ? value[0] : value)
                }
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="bonusCount"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>Bonus Count</Form.Label>
            <Form.Control>
              <Input
                type="number"
                placeholder="Enter bonus count"
                value={field.value ?? ''}
                onChange={(e) =>
                  field.onChange(
                    e.target.value === '' ? undefined : Number(e.target.value),
                  )
                }
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </div>
  );
};
