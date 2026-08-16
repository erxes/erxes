import { cn, Select } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

interface PricingSelectOption<TValue extends string> {
  value: TValue;
  label: string;
}

interface PricingOptionSelectProps<TValue extends string> {
  value: TValue;
  options: ReadonlyArray<PricingSelectOption<TValue>>;
  placeholder: string;
  onValueChange: (value: TValue) => void;
  triggerClassName?: string;
}

export const PricingOptionSelect = <TValue extends string>({
  value,
  options,
  placeholder,
  onValueChange,
  triggerClassName,
}: PricingOptionSelectProps<TValue>) => {
  const { t } = useTranslation('loyalty');

  const handleValueChange = (nextValue: string) => {
    const option = options.find(
      ({ value: optionValue }) => optionValue === nextValue,
    );

    if (option) {
      onValueChange(option.value);
    }
  };

  return (
    <Select value={value} onValueChange={handleValueChange}>
      <Select.Trigger className={cn(triggerClassName)}>
        <Select.Value placeholder={t(placeholder)} />
      </Select.Trigger>
      <Select.Content>
        {options.map((option) => (
          <Select.Item key={option.value} value={option.value}>
            {t(option.label)}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};
