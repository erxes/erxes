import { useState } from 'react';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import {
  Button,
  Combobox,
  Command,
  CommandBar,
  Popover,
  RecordTable,
  Separator,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { PricingRuleConfig } from '@/pricing/edit-pricing/components/rules/pricingRuleUtils';

interface PricingRuleMoreCellProps {
  rule: PricingRuleConfig;
  title: string;
  onEdit: (rule: PricingRuleConfig) => void;
  onDelete: (rule: PricingRuleConfig) => void;
  disabled?: boolean;
}

export const PricingRuleMoreCell = ({
  rule,
  title,
  onEdit,
  onDelete,
  disabled,
}: PricingRuleMoreCellProps) => {
  const [open, setOpen] = useState(false);
  const { t } = useTranslation('loyalty');
  const ruleLabel = title.toLowerCase();

  const handleEdit = () => {
    setOpen(false);
    onEdit(rule);
  };

  const handleDelete = () => {
    setOpen(false);
    onDelete(rule);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <RecordTable.MoreButton className="w-full h-full" disabled={disabled} />
      </Popover.Trigger>
      <Combobox.Content
        side="right"
        align="start"
        avoidCollisions={false}
        className="w-44 min-w-0"
      >
        <Command shouldFilter={false}>
          <Command.List>
            <Command.Item
              value={`edit-${rule._id}`}
              aria-label={`${t('edit')} ${ruleLabel}`}
              onSelect={handleEdit}
            >
              <IconEdit className="size-4" />
              {t('edit')}
            </Command.Item>
            <Command.Item
              value={`delete-${rule._id}`}
              aria-label={`${t('delete')} ${ruleLabel}`}
              className="text-destructive"
              onSelect={handleDelete}
            >
              <IconTrash className="size-4" />
              {t('delete')}
            </Command.Item>
          </Command.List>
        </Command>
      </Combobox.Content>
    </Popover>
  );
};

interface PricingRuleCommandBarProps {
  onDelete: (rules: PricingRuleConfig[]) => void;
  disabled?: boolean;
}

export const PricingRuleCommandBar = ({
  onDelete,
  disabled,
}: PricingRuleCommandBarProps) => {
  const { t } = useTranslation('loyalty');
  const { table } = RecordTable.useRecordTable();
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  const handleDelete = () => {
    onDelete(selectedRows.map((row) => row.original));
    table.setRowSelection({});
  };

  return (
    <CommandBar open={selectedRows.length > 0}>
      <CommandBar.Bar>
        <CommandBar.Value onClose={() => table.setRowSelection({})}>
          {t('selected-count', { count: selectedRows.length })}
        </CommandBar.Value>
        <Separator.Inline />
        <Button
          type="button"
          variant="secondary"
          className="text-destructive"
          onClick={handleDelete}
          disabled={disabled}
        >
          <IconTrash />
          {t('delete')}
        </Button>
      </CommandBar.Bar>
    </CommandBar>
  );
};
