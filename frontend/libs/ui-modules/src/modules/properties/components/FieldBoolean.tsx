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
  const { inCell, value, handleChange, id } = props;
  const [isOpen, setIsOpen] = useState(false);
  // Unset shows as false, so it starts as false.
  const [currentValue, setCurrentValue] = useState<boolean>(!!value);

  // Picking a value is the decision, so it saves right away.
  const select = (next: boolean) => {
    setCurrentValue(next);

    if (next !== !!value) {
      handleChange(next);
    }

    setIsOpen(false);
  };

  return (
    <PopoverScoped
      open={isOpen}
      onOpenChange={setIsOpen}
      closeOnEnter
      scope={id}
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
            <Command.Item value="true" onSelect={() => select(true)}>
              True <Combobox.Check checked={currentValue} />
            </Command.Item>
            <Command.Item value="false" onSelect={() => select(false)}>
              False <Combobox.Check checked={!currentValue} />
            </Command.Item>
          </Command.List>
        </Command>
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};
