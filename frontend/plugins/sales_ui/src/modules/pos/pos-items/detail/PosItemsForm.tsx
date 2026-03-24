import { Control } from 'react-hook-form';
import { Form, Input } from 'erxes-ui';
import React from 'react';
import { options } from '../../constants';
import { TPosItemFormData } from '../types/posItemType';

interface PosItemsFormProps {
  control: Control<TPosItemFormData>;
  summary?: Record<string, number>;
  paidAmounts?: Array<{ type: string; amount: number }>;
}

const formatNumberWithCommas = (value: string | number | undefined) => {
  if (value === undefined || value === '') return '';
  const num = typeof value === 'string' ? parseFloat(value) || 0 : value;
  return num.toLocaleString('en-US');
};

export const PosItemsForm = ({
  control,
  summary,
  paidAmounts,
}: PosItemsFormProps) => {
  const paymentTypes = React.useMemo(() => {
    const summaryKeys = Object.keys(summary || {});
    const paidKeys = (paidAmounts || []).map((p) => p.type);

    const standardPaymentTypes = options.map((opt) => opt.value);

    return Array.from(
      new Set([...standardPaymentTypes, ...summaryKeys, ...paidKeys]),
    )
      .filter((key) => key !== '_id')
      .sort();
  }, [summary, paidAmounts]);

  return (
    <div className="flex flex-col gap-3">
      {paymentTypes.map((paymentType) => {
        const paymentOption = options.find((opt) => opt.value === paymentType);
        const label = paymentOption?.label || paymentType;

        return (
          <Form.Field
            key={paymentType}
            control={control}
            name={paymentType}
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{label}</Form.Label>

                <Form.Control>
                  <Input
                    {...field}
                    type="text"
                    placeholder="0"
                    value={formatNumberWithCommas(field.value)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/,/g, '');
                      field.onChange(parseFloat(raw) || 0);
                    }}
                  />
                </Form.Control>

                <Form.Message />
              </Form.Item>
            )}
          />
        );
      })}
    </div>
  );
};
