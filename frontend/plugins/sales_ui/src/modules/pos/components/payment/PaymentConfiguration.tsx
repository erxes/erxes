import { Form, Label } from 'erxes-ui';
import { type Control } from 'react-hook-form';
import { SelectPayment } from '@/pos/components/payment/SelectPayment';
import { type PaymentFormData } from '@/pos/components/payment/Payment';

interface PaymentConfigurationProps {
  posType?: string;
  control: Control<PaymentFormData>;
}

export const PaymentConfiguration: React.FC<PaymentConfigurationProps> = ({
  posType,
  control,
}) => {
  return (
    <div className="space-y-6">
      <Form.Field
        control={control}
        name="paymentIds"
        render={({ field }) => (
          <Form.Item>
            <Label>PAYMENTS</Label>

            <Form.Control>
              <SelectPayment
                mode="multiple"
                value={field.value}
                onValueChange={field.onChange}
                placeholder="Select payments"
              />
            </Form.Control>
          </Form.Item>
        )}
      />
    </div>
  );
};
