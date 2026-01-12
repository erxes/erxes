import {
  Badge,
  cn,
  Combobox,
  Command,
  isDeeplyEqual,
  PopoverScoped,
  RecordTableInlineCell,
} from 'erxes-ui';
import { IField } from '../types/fieldsTypes';
import { useState } from 'react';
import { SpecificFieldProps } from './Field';
import { getStringArray } from '../propertyUtils';

export const FieldSelectMultiple = (props: SpecificFieldProps) => {
  const { field, value, handleChange, id, inCell } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState<string[]>(
    getStringArray(value),
  );

  return (
    <PopoverScoped
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          !isDeeplyEqual(currentValue, value) && handleChange(currentValue);
        }
      }}
      scope={inCell ? id : undefined}
    >
      <RecordTableInlineCell.Trigger
        className={cn(!inCell && 'shadow-xs rounded')}
      >
        {currentValue.map((item) => (
          <Badge key={item} variant="secondary">
            {field.options?.find((o) => o.value === item)?.label}
          </Badge>
        ))}
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <FieldSelectMultipleContent
          field={field}
          value={currentValue}
          onChange={(value) => {
            setCurrentValue(value);
          }}
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

export const FieldSelectMultipleContent = ({
  field,
  value,
  onChange,
}: {
  field: IField;
  value: string[];
  onChange: (value: string[]) => void;
}) => {
  const options = field.options || [];
  const handleSelect = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  return (
    <Command shouldFilter={options.length > 7}>
      <Command.Input
        placeholder="Search options"
        focusOnMount
        wrapperClassName={cn(options.length < 7 && 'opacity-0 h-0')}
      />
      <Command.List>
        {options.map((o) => (
          <Command.Item
            key={o.value}
            value={o.value as string}
            onSelect={() => handleSelect(o.value)}
          >
            {o.label}
            <Combobox.Check checked={value.includes(o.value as string)} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
