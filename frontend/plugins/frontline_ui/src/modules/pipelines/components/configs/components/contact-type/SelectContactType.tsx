import { ContactType, TPipelineConfig } from '@/pipelines/types';
import { IconAddressBook, IconBuilding, IconUser } from '@tabler/icons-react';
import { cn, Combobox, Command, Form, PopoverScoped } from 'erxes-ui';
import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';

export const SelectContactTypeValue = ({
  placeholder,
  className,
  value,
}: {
  placeholder?: string;
  className?: string;
  value: ContactType;
}) => {
  if (!value) {
    return (
      <span
        className={cn(
          'flex items-center gap-2 text-accent-foreground',
          className,
        )}
      >
        <IconAddressBook className="size-4" />
        {placeholder || 'Select contact type'}
      </span>
    );
  }

  switch (value) {
    case ContactType.CUSTOMER:
      return (
        <span className={cn('flex items-center gap-2', className)}>
          <IconUser className="size-4" /> Customer
        </span>
      );
    case ContactType.COMPANY:
      return (
        <span className={cn('flex items-center gap-2', className)}>
          <IconBuilding className="size-4" /> Company
        </span>
      );
  }
};

export const SelectContactTypeCommandItem = ({
  value,
}: {
  value: ContactType;
}) => {
  return (
    <Command.Item value={value}>
      <SelectContactTypeValue value={value} />
    </Command.Item>
  );
};
export const SelectContactTypeContent = ({
  onValueChange,
}: {
  onValueChange: (value: ContactType) => void;
}) => {
  return (
    <Command>
      <Command.List>
        <Command.Item
          value={ContactType.CUSTOMER}
          onSelect={() => onValueChange(ContactType.CUSTOMER)}
        >
          <SelectContactTypeValue value={ContactType.CUSTOMER} />
        </Command.Item>
        <Command.Item
          value={ContactType.COMPANY}
          onSelect={() => onValueChange(ContactType.COMPANY)}
        >
          <SelectContactTypeValue value={ContactType.COMPANY} />
        </Command.Item>
      </Command.List>
    </Command>
  );
};

export const SelectContactFormItem = ({
  value,
  onValueChange,
  form,
}: {
  value: ContactType;
  onValueChange: (value: ContactType) => void;
  form?: UseFormReturn<TPipelineConfig>;
}) => {
  const [open, setOpen] = useState(false);
  function handleValueChange(value: ContactType) {
    if (value === ContactType.CUSTOMER) {
      form?.resetField('company', { keepDirty: false });
    } else {
      form?.resetField('customer', { keepDirty: false });
    }
    onValueChange(value);
    setOpen(false);
  }
  return (
    <PopoverScoped open={open} onOpenChange={setOpen}>
      <Form.Control>
        <Combobox.TriggerBase className="w-fit h-7 font-medium max-w-64">
          <SelectContactTypeValue value={value} />
        </Combobox.TriggerBase>
      </Form.Control>
      <Combobox.Content>
        <SelectContactTypeContent onValueChange={handleValueChange} />
      </Combobox.Content>
    </PopoverScoped>
  );
};

export const SelectContactType = Object.assign({
  Value: SelectContactTypeValue,
  Content: SelectContactTypeContent,
  FormItem: SelectContactFormItem,
});
