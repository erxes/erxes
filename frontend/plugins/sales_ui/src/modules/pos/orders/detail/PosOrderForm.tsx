import { Control } from 'react-hook-form';
import { Form, Input } from 'erxes-ui';

interface PosOrderFormProps {
  control: Control<any>;
  summary?: any;
}

const formatNumberWithCommas = (value: string | number | undefined) => {
  if (value === undefined || value === '') return '';
  const num = typeof value === 'string' ? parseFloat(value) || 0 : value;
  return num.toLocaleString('en-US');
};

export const PosOrderForm = ({ control, summary }: PosOrderFormProps) => {
  const summaryPaymentTypes = (summary ? Object.keys(summary) || [] : [])
    .filter((a) => !['_id'].includes(a))
    .sort();

  return (
    <div className="flex flex-col gap-3">
      {summaryPaymentTypes.map((paymentType) => (
        <Form.Field
          key={paymentType}
          control={control}
          name={paymentType}
          render={({ field }) => {
            const fieldValue = field.value;

            return (
              <Form.Item>
                <Form.Label>{paymentType}</Form.Label>
                <Form.Description className="sr-only">
                  {paymentType}
                </Form.Description>
                <Form.Control>
                  <Input
                    {...field}
                    type="text"
                    placeholder="0"
                    value={formatNumberWithCommas(fieldValue)}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/,/g, '');
                      const numValue = parseFloat(rawValue) || 0;
                      field.onChange(numValue);
                    }}
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            );
          }}
        />
      ))}
    </div>
  );
};
