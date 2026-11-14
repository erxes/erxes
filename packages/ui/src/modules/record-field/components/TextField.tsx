import { Input } from 'erxes-ui/components/input';
import { TextOverflowTooltip } from 'erxes-ui/components/text-overflow';
import { PopoverScoped } from 'erxes-ui/modules/hotkey/components/PopoverScoped';
import { CellColumnHead } from 'erxes-ui/modules/record-table/components/RecordTableCell';
import { RecordTableInlineCell } from 'erxes-ui/modules/record-table/components/RecordTableCellInline';
import React, { use, useState } from 'react';

type TextFieldProps = React.ComponentProps<typeof RecordTableInlineCell.Trigger> & {
  placeholder?: string;
  value: string;
  scope?: string;
  onValueChange?: (value: string) => void;
  onSave?: (value: string) => void;
  // Starts with the editor open, e.g. the first field of a new record.
  defaultOpen?: boolean;
};

export const TextField = ({
  ref,
  placeholder,
  value,
  scope,
  onSave,
  onValueChange,
  defaultOpen = false,
  variant = 'input',
  children,
  ...props
}: TextFieldProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  // The draft while the editor is open; opening it starts from the saved value.
  const [editingValue, setEditingValue] = useState(value);
  const shown = isOpen ? editingValue : value;
  const labelled = use(CellColumnHead) !== undefined;

  /** Saves a changed text value and closes the inline editor. */
  const handleAction = (e?: React.SubmitEvent) => {
    e?.preventDefault();

    if (editingValue !== value) onSave?.(editingValue);
    setIsOpen(false);
  };

  /** Submits on Enter; Escape is handled by the popover before dismissal. */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAction();
    }
  };

  return (
    <PopoverScoped
      modal={false}
      scope={scope}
      open={isOpen}
      onOpenChange={(open, details) => {
        // Escape drops the draft instead of saving it.
        if (details?.reason === 'escape-key') {
          setEditingValue(value);
          setIsOpen(false);

          return;
        }

        setIsOpen(open);

        if (open) {
          setEditingValue(value);
        } else if (editingValue !== value) {
          onSave?.(editingValue);
        }
      }}
    >
      <RecordTableInlineCell.Trigger variant={variant} empty={!value} {...props} ref={ref}>
        {children}
        {shown ? (
          <TextOverflowTooltip value={shown} />
        ) : (
          // Under a column head or a panel label the placeholder repeats it, so only the eye reads it.
          <span aria-hidden={labelled} className="truncate">
            {placeholder}
          </span>
        )}
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content render={<form onSubmit={handleAction} />}>
        <Input
          placeholder={placeholder}
          value={editingValue}
          onChange={(e) => {
            setEditingValue(e.target.value);
            onValueChange?.(e.target.value);
          }}
          onKeyDown={handleKeyDown}
        />
        <button type="submit" className="sr-only">
          Save
        </button>
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};
