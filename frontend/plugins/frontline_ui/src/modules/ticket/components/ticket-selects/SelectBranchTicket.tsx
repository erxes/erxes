import {
  SelectTicketContent,
  SelectTriggerTicket,
  SelectTriggerVariant,
} from '@/ticket/components/ticket-selects/SelectTicket';
import { useUpdateTicket } from '@/ticket/hooks/useUpdateTicket';
import { PopoverScoped } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectBranches } from 'ui-modules';

const SelectBranchTicketFormItem = ({
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
    <SelectBranches
      mode="single"
      value={value}
      onValueChange={(branchId) => {
        onValueChange(branchId === value ? '' : (branchId as string));
        setOpen(false);
      }}
    >
      <PopoverScoped open={open} onOpenChange={setOpen}>
        <SelectTriggerTicket variant="form" label={label}>
          <SelectBranches.List
            placeholder={label ? t('none', 'None') : t('branch-label', 'Branch')}
            renderAsPlainText
          />
        </SelectTriggerTicket>
        <SelectTicketContent variant="form">
          <SelectBranches.Content />
        </SelectTicketContent>
      </PopoverScoped>
    </SelectBranches>
  );
};

const SelectBranchTicketRoot = ({
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

  const handleValueChange = (branchId: string) => {
    if (id) {
      updateTicket({ variables: { _id: id, branchId } });
    }
    onValueChange?.(branchId);
    setOpen(false);
  };

  return (
    <SelectBranches
      mode="single"
      value={value}
      onValueChange={(branchId) =>
        handleValueChange(branchId === value ? '' : (branchId as string))
      }
    >
      <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
        <SelectTriggerTicket
          variant={variant}
          disabled={disabled}
          label={label}
        >
          <SelectBranches.List
            placeholder={
              label ? t('none', 'None') : t('branch-label', 'Branch')
            }
            renderAsPlainText
          />
        </SelectTriggerTicket>
        <SelectTicketContent variant={variant}>
          <SelectBranches.Content />
        </SelectTicketContent>
      </PopoverScoped>
    </SelectBranches>
  );
};

export const SelectBranchTicket = Object.assign(SelectBranchTicketRoot, {
  FormItem: SelectBranchTicketFormItem,
});
