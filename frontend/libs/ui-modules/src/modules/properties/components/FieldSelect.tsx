import {
  cn,
  Combobox,
  Command,
  PopoverScoped,
  RecordTableInlineCell,
} from 'erxes-ui';
import { getPickableOptions } from '../propertyUtils';
import { OptionLabel } from './OptionLabel';
import { IField } from '../types/fieldsTypes';
import { useState } from 'react';
import { SpecificFieldProps } from './Field';

export const FieldSelect = (props: SpecificFieldProps) => {
  const { field, value, handleChange, id, inCell } = props;
  const [isOpen, setIsOpen] = useState(false);
  const [currentValue, setCurrentValue] = useState<string>(
    typeof value === 'string' ? value : '',
  );
  const selectedOption = field.options?.find((o) => o.value === currentValue);

  return (
    <PopoverScoped
      open={isOpen}
      onOpenChange={setIsOpen}
      closeOnEnter
      scope={inCell ? id : undefined}
    >
      <RecordTableInlineCell.Trigger
        className={cn(!inCell && 'shadow-xs rounded')}
      >
        {selectedOption && <OptionLabel option={selectedOption} />}
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <FieldSelectContent
          field={field}
          value={currentValue}
          onChange={(value) => {
            setCurrentValue(value as string);
            if (value !== currentValue) {
              handleChange(value);
            }
            setIsOpen(false);
          }}
        />
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

export const FieldSelectContent = ({
  field,
  value,
  onChange,
}: {
  field: IField;
  value: string;
  onChange: (value: string) => void;
}) => {
  const options = getPickableOptions(field, [value]);
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
            onSelect={() => onChange(o.value)}
          >
            <OptionLabel option={o} />
            <Combobox.Check checked={value === o.value} />
          </Command.Item>
        ))}
      </Command.List>
    </Command>
  );
};
