import { GeneralFormValues } from '@/pricing/edit-pricing/components/general/types';
import { formatDateValue, parseDateValue } from '@/pricing/utils/date';
import { DatePicker, Form } from 'erxes-ui';
import { Control } from 'react-hook-form';

interface GeneralDateFieldProps {
  control: Control<GeneralFormValues>;
  name: 'startDate' | 'endDate';
  label: string;
  placeholder: string;
}

export const GeneralDateField = ({
  control,
  name,
  label,
  placeholder,
}: GeneralDateFieldProps) => (
  <Form.Field
    control={control}
    name={name}
    render={({ field }) => (
      <Form.Item className="min-w-0">
        <Form.Label>{label}</Form.Label>
        <Form.Control>
          <DatePicker
            value={parseDateValue(field.value)}
            placeholder={placeholder}
            onChange={(value) => {
              field.onChange(
                value instanceof Date ? formatDateValue(value) : null,
              );
            }}
          />
        </Form.Control>
        <Form.Message />
      </Form.Item>
    )}
  />
);
