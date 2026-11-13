import {
  type AvatarProps,
  Combobox,
  Form,
  Popover,
  PopoverScoped,
  RecordTableInlineCell,
  cn,
} from 'erxes-ui';
import { useState } from 'react';
import {
  SelectMemberContent,
  SelectMemberProvider,
  SelectMemberValue,
} from './SelectMemberProvider';

/** The member as a record table cell; click to pick another. */
const SelectMemberInlineCell = ({
  ref,
  value,
  onValueChange,
  scope,
  placeholder,
  size = 'lg',
  className,
  id,
}: {
  value?: string | null;
  onValueChange?: (value: string[] | string | null) => void;
  scope?: string;
  placeholder?: string;
  size?: AvatarProps['size'];
  className?: string;
  id?: string;
} & React.RefAttributes<React.ComponentRef<typeof RecordTableInlineCell.Trigger>>) => {
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
};

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

/** The member picker's inline cell and form item. */
export const SelectMember = {
  InlineCell: SelectMemberInlineCell,
  FormItem: SelectMemberFormItem,
};
