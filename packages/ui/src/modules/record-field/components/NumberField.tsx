import { Input } from 'erxes-ui/components/input';
import { TextOverflowTooltip } from 'erxes-ui/components/text-overflow';
import React, { useState } from 'react';

import { PopoverScoped } from 'erxes-ui/modules/hotkey/components/PopoverScoped';
import { RecordTableInlineCell } from 'erxes-ui/modules/record-table/components/RecordTableCellInline';

type NumberFieldProps = React.ComponentProps<typeof RecordTableInlineCell.Trigger> & {
    placeholder?: string;
    value: number;
    scope: string;
    onValueChange?: (value: number) => void;
    onSave?: (value: number) => void;
    formatValue?: (value: number) => string;
  };

export const NumberField = ({
  placeholder,
  value,
  scope,
  onSave,
  onValueChange,
  formatValue,
  children,
  ...props
}: NumberFieldProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingValue, setEditingValue] = useState(String(value));
  const [isEdited, setIsEdited] = useState(false);
  const shown = isOpen ? editingValue : formatValue ? formatValue(value) : value.toLocaleString();

  const resetEditing = () => {
    setEditingValue(String(value));
    setIsEdited(false);
  };

  const handleAction = (e?: React.SubmitEvent) => {
    e?.preventDefault();
    const numValue = Number(editingValue) || 0;

    if (numValue !== value) {
      onSave?.(numValue);
    }

    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      resetEditing();
      setIsOpen(false);
    }
  };

  return (
    <PopoverScoped
      scope={scope}
      open={isOpen}
      onOpenChange={(open: boolean) => {
        setIsOpen(open);

        if (open) {
          resetEditing();
        } else if (isEdited) {
          handleAction();
        }
      }}
    >
      <RecordTableInlineCell.Trigger {...props}>
        {children}
        <TextOverflowTooltip value={shown ?? placeholder} />
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content render={<form onSubmit={handleAction} />}>
        <Input
          type="text"
          value={editingValue.toLocaleString()}
          onChange={(e) => {
            const rawValue = e.target.value.replace(/,/g, '');

            if (/^-?\d*\.?\d*$/.test(rawValue)) {
              setEditingValue(rawValue);
              setIsEdited(true);
              const numValue = Number(rawValue);

              if (!isNaN(numValue)) {
                onValueChange?.(numValue);
              }
            }

            setIsOpen(true);
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
