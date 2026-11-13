import type { ButtonProps } from 'erxes-ui/components/button';
import { Input } from 'erxes-ui/components/input';
import { TextOverflowTooltip } from 'erxes-ui/components/text-overflow';
import { cn } from 'erxes-ui/lib/utils';
import { PopoverScoped } from 'erxes-ui/modules/hotkey/components/PopoverScoped';
import { RecordTableInlineCell } from 'erxes-ui/modules/record-table/components/RecordTableCellInline';
import React, { useState } from 'react';

type TextFieldProps = ButtonProps &
  React.RefAttributes<HTMLButtonElement> & {
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
  children,
  ...props
}: TextFieldProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  // The draft while the editor is open; opening it starts from the saved value.
  const [editingValue, setEditingValue] = useState(value);

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
      onOpenChange={(open: boolean) => {
        setIsOpen(open);

        if (open) {
          setEditingValue(value);
        } else if (editingValue !== value) {
          onSave?.(editingValue);
        }
      }}
    >
      <RecordTableInlineCell.Trigger
        className={cn('shadow-xs rounded-sm', props.className)}
        {...props}
        ref={ref}
      >
        {children}
        <TextOverflowTooltip value={(isOpen ? editingValue : value) || placeholder} />
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content
        asChild
        onEscapeKeyDown={(event) => {
          event.preventDefault();
          setEditingValue(value);
          setIsOpen(false);
        }}
      >
        <form onSubmit={handleAction}>
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
        </form>
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};
