import { Form, Select } from 'erxes-ui';
import { DEFAULT_PAY_DATA } from '../constants/defaultPayData';
import { INVOICE_DATA } from '../constants/invoiceData';
import { KHAN_BANK_ACCOUNT_DATA } from '../constants/khanBankAccountData';
import { GOLOMT_BANK_ACCOUNT_DATA } from '../constants/golomtBankAccount';
import { BARTER_DATA } from '../constants/barterData';
import { TFormControl } from '../types/form';

interface PaymentFieldsProps {
  control: TFormControl;
}
export const PaymentFields: React.FC<PaymentFieldsProps> = ({ control }) => {
  return (
    <div className="grid grid-cols-5 gap-4 w-full">
      <Form.Field
        control={control}
        name="defaultPay"
        render={({ field }) => (
          <Form.Item className="w-full">
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
      <Form.Field
        control={control}
        name="нэхэмжлэх"
        render={({ field }) => (
          <Form.Item className="w-full">
            <Form.Label>Нэхэмжлэх</Form.Label>
            <Select value={field.value} onValueChange={field.onChange}>
              <Select.Trigger className="w-full">
                <Select.Value placeholder="Нэхэмжлэх" />
              </Select.Trigger>
              <Select.Content>
                {INVOICE_DATA.map((type) => (
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
      <Form.Field
        control={control}
        name="хаанБанкданс"
        render={({ field }) => (
          <Form.Item className="w-full">
            <Form.Label>Хаан банк данс</Form.Label>
            <Select value={field.value} onValueChange={field.onChange}>
              <Select.Trigger className="w-full">
                <Select.Value placeholder="Хаан банк данс" />
              </Select.Trigger>
              <Select.Content>
                {KHAN_BANK_ACCOUNT_DATA.map((type) => (
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
      <Form.Field
        control={control}
        name="голомтБанкданс"
        render={({ field }) => (
          <Form.Item className="w-full">
            <Form.Label>Голомт банк данс</Form.Label>
            <Select value={field.value} onValueChange={field.onChange}>
              <Select.Trigger className="w-full">
                <Select.Value placeholder="Голомт банк данс" />
              </Select.Trigger>
              <Select.Content>
                {GOLOMT_BANK_ACCOUNT_DATA.map((type) => (
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
      <Form.Field
        control={control}
        name="barter"
        render={({ field }) => (
          <Form.Item className="w-full">
            <Form.Label>Бартер</Form.Label>
            <Select value={field.value} onValueChange={field.onChange}>
              <Select.Trigger className="w-full">
                <Select.Value placeholder="Бартер" />
              </Select.Trigger>
              <Select.Content>
                {BARTER_DATA.map((type) => (
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
    </div>
  );
};
