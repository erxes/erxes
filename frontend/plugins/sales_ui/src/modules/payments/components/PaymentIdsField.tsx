'use client';

import { Form } from 'erxes-ui';
import { Control, FieldValues, Path } from 'react-hook-form';
import { SelectPayment } from '@/payments/components/SelectPayment';

type PaymentIdsFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
};

export const PaymentIdsField = <TFieldValues extends FieldValues>({
  control,
}: PaymentIdsFieldProps<TFieldValues>) => {
  return (
    <Form.Field
      control={control}
      name={'paymentIds' as Path<TFieldValues>}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>PAYMENTS</Form.Label>
          <Form.Description>
            Select payments that you want to use
          </Form.Description>
          <SelectPayment.FormItem
            mode="multiple"
            value={Array.isArray(field.value) ? field.value : []}
            onValueChange={(value) => {
              field.onChange(Array.isArray(value) ? value : []);
            }}
            placeholder="Select payments"
          />
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};
