import { Form, MultipleSelector, MultiSelectOption } from 'erxes-ui';
import { ControllerRenderProps, useFormContext, Path } from 'react-hook-form';
import { TGeneralSettingsProps } from '@/settings/general/types';
import { CURRENCY_CODES } from 'erxes-ui';

const Selector = (
  field: ControllerRenderProps<TGeneralSettingsProps, 'dealCurrency'>,
) => {
  const curr: Record<string, { label: string }> = CURRENCY_CODES;
  const formattedValue =
    field.value?.map((val: string) => ({
      label: curr[val]?.label || val,
      value: val,
    })) || [];
  const currencyOptions = Object.entries(curr).map(([value, { label }]) => ({
    label,
    value,
  }));

  const handleOnChange = (options: MultiSelectOption[]) => {
    const formattedOptions = options?.map((option) => option.value);
    field.onChange(formattedOptions);
  };
  return (
    <Form.Item className="pb-4">
      <Form.Label>Currency</Form.Label>
      <Form.Control>
        <MultipleSelector
          options={currencyOptions}
          onChange={handleOnChange}
          value={formattedValue}
        />
      </Form.Control>
    </Form.Item>
  );
};
export function SelectCurrency() {
  const { control } = useFormContext<TGeneralSettingsProps>();
  return (
    <Form.Field
      control={control}
      name="dealCurrency"
      render={({ field }) => <Selector {...field} />}
    />
  );
}
