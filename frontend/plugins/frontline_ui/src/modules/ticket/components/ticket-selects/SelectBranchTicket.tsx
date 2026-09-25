import {
  SelectTicketContent,
  SelectTriggerTicket,
  SelectTriggerVariant,
} from '@/ticket/components/ticket-selects/SelectTicket';
import { PopoverScoped } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectBranches } from 'ui-modules';

const SelectBranchTicketFormItem = ({
  value,
  onValueChange,
}: {
  value: string;
  onValueChange: (value: string) => void;
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
        <SelectTriggerTicket variant="form">
          <SelectBranches.List
            placeholder={t('branch-label', 'Branch')}
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
  scope,
  value,
  onValueChange,
}: {
  variant?: `${SelectTriggerVariant}`;
  disabled?: boolean;
  scope?: string;
  value: string;
  onValueChange?: (value: string) => void;
}) => {
  const { t } = useTranslation('frontline');
  const [open, setOpen] = useState(false);

  return (
    <SelectBranches
      mode="single"
      value={value}
      onValueChange={(branchId) => {
        onValueChange?.(branchId === value ? '' : (branchId as string));
        setOpen(false);
      }}
    >
      <PopoverScoped scope={scope} open={open} onOpenChange={setOpen}>
        <SelectTriggerTicket variant={variant} disabled={disabled}>
          <SelectBranches.List
            placeholder={t('branch-label', 'Branch')}
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
