import { Form, Label, Input } from 'erxes-ui';
import { type Control } from 'react-hook-form';
import { isFieldVisible } from '@/pos/constants';
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
      {isFieldVisible('choosePayment', posType) && (
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
      )}

      {isFieldVisible('appToken', posType) && (
        <Form.Field
          control={control}
          name="erxesAppToken"
          render={({ field }) => (
            <Form.Item>
              <Label>ERXES APP TOKEN:</Label>

              <Form.Control>
                <Input
                  type="text"
                  placeholder="Enter Erxes app token"
                  {...field}
                />
              </Form.Control>
            </Form.Item>
          )}
        />
      )}
    </div>
  );
};
