import { Select } from 'erxes-ui';

type TPosOption = {
  value: string;
  label: string;
};

const EMPTY_OPTION_VALUE = '__empty__';

export const PosOptionInput = ({
  value,
  onChange,
  options,
  placeholder,
  allowEmpty,
  emptyLabel = 'Any',
}: {
  value?: string;
  onChange: (value: string) => void;
  options: TPosOption[];
  placeholder?: string;
  allowEmpty?: boolean;
  emptyLabel?: string;
}) => {
  return (
    <Select
      value={value || (allowEmpty ? EMPTY_OPTION_VALUE : undefined)}
      onValueChange={(selectedValue) =>
        onChange(selectedValue === EMPTY_OPTION_VALUE ? '' : selectedValue)
      }
    >
      <Select.Trigger>
        <Select.Value placeholder={placeholder || 'Select option'} />
      </Select.Trigger>
      <Select.Content>
        {allowEmpty && (
          <Select.Item value={EMPTY_OPTION_VALUE}>{emptyLabel}</Select.Item>
        )}
        {options.map((option) => (
          <Select.Item key={option.value} value={option.value}>
            {option.label}
          </Select.Item>
        ))}
      </Select.Content>
    </Select>
  );
};
