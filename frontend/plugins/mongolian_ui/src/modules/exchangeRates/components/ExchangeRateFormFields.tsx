import { DatePicker, Form, Input, Select } from 'erxes-ui';
import { useEffect } from 'react';
import { FieldPath, UseFormReturn } from 'react-hook-form';
import { TExchangeRateForm } from '../constants';
import { useCurrencies } from '../hooks/useCurrencies';

type Props = {
  form: UseFormReturn<TExchangeRateForm>;
  formId: string;
  onSubmit: (values: TExchangeRateForm) => void;
};

type CurrencyFieldProps = {
  form: UseFormReturn<TExchangeRateForm>;
  name: FieldPath<TExchangeRateForm>;
  label: string;
  placeholder: string;
  currencies: string[];
};

const CurrencyField = ({
  form,
  name,
  label,
  placeholder,
  currencies,
}: CurrencyFieldProps) => (
  <Form.Field
    control={form.control}
    name={name}
    render={({ field }) => (
      <Form.Item>
        <Form.Label>{label}</Form.Label>
        <Form.Control>
          <Select value={field.value as string} onValueChange={field.onChange}>
            <Select.Trigger>
              <Select.Value placeholder={placeholder} />
            </Select.Trigger>
            <Select.Content>
              {currencies.map((currency) => (
                <Select.Item key={currency} value={currency}>
                  {currency}
                </Select.Item>
              ))}
            </Select.Content>
          </Select>
        </Form.Control>
        <Form.Message />
      </Form.Item>
    )}
  />
);

export const ExchangeRateFormFields = ({ form, formId, onSubmit }: Props) => {
  const { currencies, mainCurrency } = useCurrencies();
  const { setValue, getValues } = form;

  // Pre-select the system main currency when adding a new rate.
  useEffect(() => {
    if (mainCurrency && !getValues('mainCurrency')) {
      setValue('mainCurrency', mainCurrency);
    }
  }, [mainCurrency, setValue, getValues]);

  return (
    <Form {...form}>
      <form
        id={formId}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-5"
      >
        <Form.Field
          control={form.control}
          name="date"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Start Date</Form.Label>
              <Form.Control>
                <DatePicker
                  value={field.value}
                  format="YYYY-MM-DD"
                  onChange={(d) => d instanceof Date && field.onChange(d)}
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <CurrencyField
            form={form}
            name="mainCurrency"
            label="Main Currency"
            placeholder="Choose a main currency"
            currencies={currencies}
          />
          <CurrencyField
            form={form}
            name="rateCurrency"
            label="Rate Currency"
            placeholder="Choose a rate currency"
            currencies={currencies}
          />
        </div>

        <Form.Field
          control={form.control}
          name="rate"
          render={({ field }) => (
            <Form.Item>
              <Form.Label>Rate</Form.Label>
              <Form.Control>
                <Input.Number
                  value={field.value}
                  onChange={(value) => field.onChange(Number(value) || 0)}
                  placeholder="0.00"
                />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      </form>
    </Form>
  );
};
