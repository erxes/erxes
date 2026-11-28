import type { Customer } from '@erxes/core-contract';
import { IconRepeat, IconTrash } from '@tabler/icons-react';
import { Button, Command, CommandBar, Popover, RecordTable, Separator, useConfirm } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelectedRows } from '~/components/useSelectedRows';
import { useCan } from '~/modules/auth/session';
import { LeadsBulkActions } from '~/modules/leads/LeadActions';
import { useSidePanel } from '~/modules/side-panel/useSidePanel';
import { TagsSelect } from '~/modules/tags/TagsSelect';
import { commonTagIds, MergeButton, tagChange } from '../components/MergeButton';
import { CustomersMerge } from '../components/ContactsMerge';
import { useCustomersRemove, useCustomersTag } from './useCustomers';

/** The Actions menu: delete the selected customers once confirmed. */
const CustomersDeleteMenu = ({ ids }: { ids: string[] }) => {
  const { table } = RecordTable.useRecordTable();
  const { confirm } = useConfirm();
  const { t: tContact } = useTranslation('contact', { keyPrefix: 'customer' });
  const remove = useCustomersRemove();
  const [open, setOpen] = useState(false);

  const deleteSelected = () => {
    setOpen(false);
    void confirm({
      message: tContact('confirm-delete-selected', { count: ids.length }),
    }).then(() => remove.mutate({ ids }, { onSuccess: () => table.setRowSelection({}) }));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger render={<Button variant="secondary" />}>
        <IconRepeat />
        {tContact('actions')}
      </Popover.Trigger>
      <Popover.Content
        variant="flush"
        className="min-w-70"
        align="end"
        side="top"
        sideOffset={10}
        aria-label={tContact('selected-actions', 'Actions on the selected customers')}
      >
        <Command>
          <Command.List>
            <Command.Group>
              <Command.Item variant="destructive" onSelect={deleteSelected}>
                <IconTrash />
                {tContact('action-delete')}
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </Popover.Content>
    </Popover>
  );
};

/** Merges the two selected customers into the one kept, then opens it. */
const CustomersMergeDialog = ({
  customers,
  open,
  onOpenChange,
}: {
  customers: Customer[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { table } = RecordTable.useRecordTable();
  const { openRecord } = useSidePanel();

  return (
    <CustomersMerge
      records={customers}
      open={open}
      onOpenChange={onOpenChange}
      onMerged={(keptId) => {
        onOpenChange(false);
        table.resetRowSelection(true);
        openRecord({ contentType: 'core:customer', contentId: keptId });
      }}
    />
  );
};

/** Actions on the selected rows, at the bottom of the screen. */
export const CustomersCommandBar = ({ rows }: { rows: Customer[] }) => {
  const { t } = useTranslation('contact', { keyPrefix: 'customer' });
  const tag = useCustomersTag();
  const [merging, setMerging] = useState(false);
  const customers = useSelectedRows(rows);
  const customerIds = customers.map((customer) => customer.id);
  const tagIds = commonTagIds(customers);
  // Owners and admins merge and delete (core's rule).
  const manager = useCan()('contacts.merge');

  return (
    <>
      <CommandBar open={customers.length > 0 && !merging}>
        <CommandBar.Bar>
          <CommandBar.Value>{t('selected', { selectedCount: customers.length })}</CommandBar.Value>
          <Separator.Inline />
          <TagsSelect
            type="customer"
            variant="secondary"
            value={tagIds}
            onValueChange={(next) => tag.mutate({ ids: customerIds, ...tagChange(tagIds, next) })}
          />
          {customers.every((customer) => customer.state === 'lead') && (
            <>
              <Separator.Inline />
              <LeadsBulkActions recordType="customer" leads={customers} />
            </>
          )}
          {manager && (
            <>
              <Separator.Inline />
              <MergeButton
                label={t('action-merge')}
                tooltip={t('merge-tooltip')}
                disabled={customers.length !== 2}
                onClick={() => setMerging(true)}
              />
              <Separator.Inline />
              <CustomersDeleteMenu ids={customerIds} />
            </>
          )}
        </CommandBar.Bar>
      </CommandBar>
      <CustomersMergeDialog customers={customers} open={merging} onOpenChange={setMerging} />
    </>
  );
};
