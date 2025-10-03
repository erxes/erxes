import { useFormContext } from 'react-hook-form';
import { TGeneralSettingsProps } from '../types';
import { CurrencyCode, CurrencyField, Form } from 'erxes-ui';

export function SelectMainCurrency() {
  const form = useFormContext<TGeneralSettingsProps>();
  return (
    <Form.Field
      control={form.control}
      name="mainCurrency"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>Main currency</Form.Label>
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
