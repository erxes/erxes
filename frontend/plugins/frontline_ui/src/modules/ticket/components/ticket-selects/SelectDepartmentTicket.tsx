import {
  SelectTicketContent,
  SelectTriggerTicket,
  SelectTriggerVariant,
} from '@/ticket/components/ticket-selects/SelectTicket';
import { useUpdateTicket } from '@/ticket/hooks/useUpdateTicket';
import { PopoverScoped } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectDepartments } from 'ui-modules';

const SelectDepartmentTicketFormItem = ({
  value,
  onValueChange,
  label,
}: {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
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
        <SelectTriggerTicket variant="form" label={label}>
          <SelectDepartments.List
            placeholder={label ? t('none', 'None') : t('department-label', 'Department')}
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
  id,
}: {
  variant?: `${SelectTriggerVariant}`;
  disabled?: boolean;
  label?: string;
  scope?: string;
  value: string;
  onValueChange?: (value: string) => void;
  id?: string;
}) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);
  const { updateTicket } = useUpdateTicket();

  const handleValueChange = (departmentId: string) => {
    if (id) {
      updateTicket({ variables: { _id: id, departmentId } });
    }
    onValueChange?.(departmentId);
    setOpen(false);
  };

  return (
    <SelectDepartments
      mode="single"
      value={value}
      onValueChange={(departmentId) =>
        handleValueChange(
          departmentId === value ? '' : (departmentId as string),
        )
      }
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
