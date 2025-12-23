import { ButtonProps, Input, TextOverflowTooltip } from 'erxes-ui/components';
import React, { useState } from 'react';

import { PopoverScoped } from 'erxes-ui/modules/hotkey';
import { RecordTableInlineCell } from 'erxes-ui/modules/record-table';

export interface INumberFieldContainerProps {
  placeholder?: string;
  value: number;
  field: string;
  fieldId?: string;
  _id: string;
  scope?: string;
}

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
      if (editingValue !== value) {
        onSave?.(editingValue);
      }
      setIsOpen(false);
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
          <TextOverflowTooltip
            value={
              (isOpen ? editingValue.toString() : value.toLocaleString()) ??
              placeholder
            }
          />
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content asChild>
          <form onSubmit={handleAction}>
            <Input
              type="text"
              value={editingValue.toLocaleString()}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/,/g, '');
                const numValue = Number(rawValue);
                if (!isNaN(numValue) || rawValue === '') {
                  setEditingValue(numValue || 0);
                  onValueChange?.(numValue || 0);
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
