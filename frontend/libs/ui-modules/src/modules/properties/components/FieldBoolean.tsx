import {
  cn,
  Combobox,
  Command,
  PopoverScoped,
  RecordTableInlineCell,
} from 'erxes-ui';
import { SpecificFieldProps } from './Field';
import { useState } from 'react';
import { IconCheck, IconX } from '@tabler/icons-react';

export const FieldBoolean = (props: SpecificFieldProps) => {
  const { inCell } = props;
  const { value, handleChange } = props;
  const [currentValue, setCurrentValue] = useState<boolean>(value);
  return (
    <PopoverScoped
      closeOnEnter
      scope={props.id}
      onOpenChange={(open, reason) => {
        if (!open) {
          reason === 'close' && handleChange(value);
          if (reason === 'enter') {
            currentValue !== value && handleChange(currentValue);
          }
        }
      }}
    >
      <RecordTableInlineCell.Trigger
        className={cn(!inCell && 'shadow-xs rounded')}
      >
        {currentValue ? (
          <>
            <IconCheck />
            True
          </>
        ) : (
          <>
            <IconX />
            False
          </>
        )}
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content>
        <Command shouldFilter={false}>
          <Command.Input
            placeholder="Search"
            focusOnMount
            wrapperClassName="opacity-0 h-0"
          />
          <Command.List>
            <Command.Item value="true" onSelect={() => setCurrentValue(true)}>
              True <Combobox.Check checked={currentValue} />
            </Command.Item>
            <Command.Item value="false" onSelect={() => setCurrentValue(false)}>
              False <Combobox.Check checked={!currentValue} />
            </Command.Item>
          </Command.List>
        </Command>
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};
