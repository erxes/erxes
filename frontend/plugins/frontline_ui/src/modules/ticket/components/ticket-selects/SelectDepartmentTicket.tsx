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

/** Binds a ticket department selector to its form value. */
const SelectDepartmentTicketFormItem = ({
  value,
  onValueChange,
  label,
  variant = 'form',
}: {
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  variant?: 'form' | 'table';
}) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.ticket' });
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
        <SelectTriggerTicket variant={variant} label={label}>
          <SelectDepartments.List
            placeholder={label ? t('none') : t('department-label')}
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

/** Composes the ticket department picker and its change handler. */
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
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.ticket' });
  const [open, setOpen] = useState(false);
  const { updateTicket } = useUpdateTicket();

  /** Applies the selected department and notifies the caller. */
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
            placeholder={label ? t('none') : t('department-label')}
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
