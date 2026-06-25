'use client';

import { Form } from 'erxes-ui';
import { Control, FieldValues, Path } from 'react-hook-form';
import { SelectPayment } from '@/payments/components/SelectPayment';
import { useTranslation } from 'react-i18next';

type PaymentIdsFieldProps<TFieldValues extends FieldValues> = {
  control: Control<TFieldValues>;
};

export const PaymentIdsField = <TFieldValues extends FieldValues>({
  control,
}: PaymentIdsFieldProps<TFieldValues>) => {
  const { t } = useTranslation('sales');
  return (
    <Form.Field
      control={control}
      name={'paymentIds' as Path<TFieldValues>}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('PAYMENTS')}</Form.Label>
          <Form.Description>
            {t('select-payments-to-use')}
          </Form.Description>
          <SelectPayment.FormItem
            mode="multiple"
            value={Array.isArray(field.value) ? field.value : []}
            onValueChange={(value) => {
              field.onChange(Array.isArray(value) ? value : []);
            }}
            placeholder={t('select-payments')}
          />
          <Form.Message className="text-destructive" />
        </Form.Item>
      )}
    />
  );
};
