import { ButtonProps, Input, TextOverflowTooltip } from 'erxes-ui/components';
import { PopoverScoped } from 'erxes-ui/modules/hotkey';
import { RecordTableInlineCell } from 'erxes-ui/modules/record-table';

import React, { useState } from 'react';

export const NumberField = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & {
    placeholder?: string;
    value: number;
    scope: string;
    onValueChange?: (value: number) => void;
    onSave?: (value: number) => void;
  }
>(
  (
    { placeholder, value, scope, onSave, onValueChange, children, ...props },
    ref,
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [editingValue, setEditingValue] = useState(value);

    const handleAction = (e: React.FormEvent) => {
      e.preventDefault();
      if (editingValue === value) return;
      onSave?.(editingValue);
    };

    return (
      <PopoverScoped
        scope={scope}
        open={isOpen}
        onOpenChange={(open: boolean) => {
          setIsOpen(open);
          if (open) {
            setEditingValue(value);
          }
        }}
      >
        <RecordTableInlineCell.Trigger {...props} ref={ref}>
          {children}
          <TextOverflowTooltip value={editingValue.toString() ?? placeholder} />
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content asChild>
          <form onSubmit={handleAction}>
            <Input
              type="number"
              value={editingValue.toString()}
              onChange={(e) => {
                const numValue = Number(e.target.value);
                if (!isNaN(numValue)) {
                  setEditingValue(numValue);
                  onValueChange?.(numValue);
                }
                setIsOpen(true);
              }}
            />
            <button type="submit" className="sr-only">
              Save
            </button>
          </form>
        </RecordTableInlineCell.Content>
      </PopoverScoped>
    );
  },
);
