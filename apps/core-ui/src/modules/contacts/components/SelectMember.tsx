import {
  type AvatarProps,
  Combobox,
  Form,
  Popover,
  PopoverScoped,
  RecordTableInlineCell,
  cn,
} from 'erxes-ui';
import { forwardRef, useState } from 'react';
import {
  SelectMemberFilterBar,
  SelectMemberFilterItem,
  SelectMemberFilterView,
} from './SelectMemberFilter';
import {
  SelectMemberContent,
  SelectMemberProvider,
  SelectMemberValue,
} from './SelectMemberProvider';

/** The member as a record table cell; click to pick another. */
const SelectMemberInlineCell = forwardRef<
  React.ComponentRef<typeof RecordTableInlineCell.Trigger>,
  {
    value?: string | null;
    onValueChange?: (value: string[] | string | null) => void;
    scope?: string;
    placeholder?: string;
    size?: AvatarProps['size'];
    className?: string;
    id?: string;
  }
>(({ value, onValueChange, scope, placeholder, size = 'lg', className, id }, ref) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectMemberProvider value={value} onValueChange={onValueChange} setOpen={setOpen}>
      <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
        <RecordTableInlineCell.Trigger ref={ref} id={id} className={cn(className, 'text-xs')}>
          <SelectMemberValue placeholder={placeholder ?? ''} size={size} />
        </RecordTableInlineCell.Trigger>
        <RecordTableInlineCell.Content>
          <SelectMemberContent />
        </RecordTableInlineCell.Content>
      </PopoverScoped>
    </SelectMemberProvider>
  );
});

SelectMemberInlineCell.displayName = 'SelectMemberInlineCell';

/** A member picker as a form control. */
const SelectMemberFormItem = ({
  value,
  onValueChange,
  className,
  placeholder,
}: {
  value?: string | null;
  onValueChange?: (value: string | undefined) => void;
  className?: string;
  placeholder?: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <SelectMemberProvider
      value={value}
      onValueChange={(next) => onValueChange?.(typeof next === 'string' ? next : undefined)}
      setOpen={setOpen}
    >
      <Popover open={open} onOpenChange={setOpen}>
        <Form.Control>
          <Combobox.Trigger className={cn('w-full shadow-xs', className)}>
            <SelectMemberValue placeholder={placeholder} />
          </Combobox.Trigger>
        </Form.Control>
        <Combobox.Content>
          <SelectMemberContent />
        </Combobox.Content>
      </Popover>
    </SelectMemberProvider>
  );
};

/** Old ui-modules SelectMember: the inline cell, form item and filter parts contacts use. */
export const SelectMember = {
  InlineCell: SelectMemberInlineCell,
  FormItem: SelectMemberFormItem,
  FilterItem: SelectMemberFilterItem,
  FilterView: SelectMemberFilterView,
  FilterBar: SelectMemberFilterBar,
};
