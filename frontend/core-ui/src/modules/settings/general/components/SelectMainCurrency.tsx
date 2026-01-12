import { useFormContext } from 'react-hook-form';
import { TGeneralSettingsProps } from '../types';
import { CurrencyCode, CurrencyField, Form } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export function SelectMainCurrency() {
  const form = useFormContext<TGeneralSettingsProps>();
  const { t } = useTranslation('settings', {
    keyPrefix: 'general',
  });
  return (
    <Form.Field
      control={form.control}
      name="mainCurrency"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('main-currency')}</Form.Label>
          <Form.Control>
            <CurrencyField.SelectCurrency
              value={field.value as CurrencyCode}
              onChange={(value) => field.onChange(value)}
              className="w-full"
            />
          </Form.Control>
        </Form.Item>
      )}
    />
  );
}
