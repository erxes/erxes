import { Form, Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { DEFAULT_PAY_DATA } from '../constants/defaultPayData';
import { TFormControl } from '../types/form';

interface PaymentFieldsProps {
  control: TFormControl;
}

export const PaymentFields: React.FC<PaymentFieldsProps> = ({ control }) => {
  const { t } = useTranslation('mongolian');
  return (
    <Form.Field
      control={control}
      name="defaultPay"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('default-pay')}</Form.Label>
          <Select value={field.value} onValueChange={field.onChange}>
            <Select.Trigger className="w-full">
              <Select.Value placeholder={t('default-pay')} />
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
