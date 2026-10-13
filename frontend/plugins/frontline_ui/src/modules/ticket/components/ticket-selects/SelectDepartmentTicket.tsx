import {
  SelectTicketContent,
  SelectTriggerTicket,
  SelectTriggerVariant,
} from '@/ticket/components/ticket-selects/SelectTicket';
import { PopoverScoped } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectDepartments } from 'ui-modules';

const SelectDepartmentTicketFormItem = ({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
}) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);

  return (
    <SelectDepartments
      mode="single"
      value={value}
      onValueChange={(departmentId) => {
        onValueChange(departmentId === value ? '' : (departmentId as string));
        setOpen(false);
      }}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <SelectTriggerTicket variant="form">
          <SelectDepartments.List
            placeholder={t('department-label', 'Department')}
            renderAsPlainText
          />
        </SelectTriggerTicket>
        <SelectTicketContent variant="form">
          <SelectDepartments.Content />
        </SelectTicketContent>
      </PopoverScoped>
    </SelectDepartments>
  );
};

const SelectDepartmentTicketRoot = ({
  variant = 'detail',
  disabled,
  label,
  scope,
  value,
  onValueChange,
}: {
  variant?: `${SelectTriggerVariant}`;
  disabled?: boolean;
  label?: string;
  scope?: string;
  value: string;
  onValueChange?: (value: string) => void;
}) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);

  return (
    <SelectDepartments
      mode="single"
      value={value}
      onValueChange={(departmentId) => {
        onValueChange?.(departmentId === value ? '' : (departmentId as string));
        setOpen(false);
      }}
    >
      <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
        <SelectTriggerTicket
          variant={variant}
          disabled={disabled}
          label={label}
        >
          <SelectDepartments.List
            placeholder={
              label ? t('none', 'None') : t('department-label', 'Department')
            }
            renderAsPlainText
          />
        </SelectTriggerTicket>
        <SelectTicketContent variant={variant}>
          <SelectDepartments.Content />
        </SelectTicketContent>
      </PopoverScoped>
    </SelectDepartments>
  );
};

export const SelectDepartmentTicket = Object.assign(
  SelectDepartmentTicketRoot,
  {
    FormItem: SelectDepartmentTicketFormItem,
  },
);
