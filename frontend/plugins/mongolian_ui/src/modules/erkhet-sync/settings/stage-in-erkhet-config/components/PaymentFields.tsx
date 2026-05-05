import { Form, Select } from 'erxes-ui';
import { DEFAULT_PAY_DATA } from '../constants/defaultPayData';
import { TFormControl } from '../types/form';

interface PaymentFieldsProps {
  control: TFormControl;
}

export const PaymentFields: React.FC<PaymentFieldsProps> = ({ control }) => {
  return (
    <Form.Field
      control={control}
      name="defaultPay"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Default Pay</Form.Label>
          <Select value={field.value} onValueChange={field.onChange}>
            <Select.Trigger className="w-full">
              <Select.Value placeholder="Default Pay" />
            </Select.Trigger>
            <Select.Content>
              {DEFAULT_PAY_DATA.map((type) => (
                <Select.Item key={type.value} value={type.value}>
                  {type.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};
