import { Control } from 'react-hook-form';
import { Form, Input } from 'erxes-ui';
import React from 'react';
import { TPosItemFormData } from '../types/posItemType';

interface PosItemsFormProps {
  control: Control<TPosItemFormData>;
  // paidAmounts from backend: [{ type, amount, title }]
  paidAmounts?: Array<{ type: string; amount: number; title?: string }>;
}

const formatNumberWithCommas = (value: string | number | undefined) => {
  if (value === undefined || value === '') return '';
  const num = typeof value === 'string' ? parseFloat(value) || 0 : value;
  return num.toLocaleString('en-US');
};

export const PosItemsForm = ({ control, paidAmounts }: PosItemsFormProps) => {
  // Build ordered list from paidAmounts, deduplicated by type
  const paymentEntries = React.useMemo(() => {
    const seen = new Set<string>();
    return (paidAmounts || [])
      .filter(({ type }) => {
        if (!type || type === '_id' || seen.has(type)) return false;
        seen.add(type);
        return true;
      })
      .map(({ type, title }) => ({ type, label: title || type }));
  }, [paidAmounts]);

  return (
    <div className="flex flex-col gap-3">
      {paymentEntries.map(({ type, label }) => {
        const paymentType = type;

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
