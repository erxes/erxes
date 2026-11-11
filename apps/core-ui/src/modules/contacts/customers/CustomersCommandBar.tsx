import type { Customer } from '@erxes/core-contract';
import { IconRepeat, IconTrash } from '@tabler/icons-react';
import { Button, Command, CommandBar, Popover, RecordTable, Separator, useConfirm } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSession } from '~/modules/auth/session';
import { useSidePanel } from '~/modules/side-panel/useSidePanel';
import { TagsSelect } from '~/modules/tags/TagsSelect';
import { commonTagIds, MergeButton, tagChange } from '../components/MergeButton';
import { MergeDialog } from '../components/MergeDialog';
import { customerTitle } from '../components/ContactPicker';
import { CustomersChangeState } from './CustomersChangeState';
import { useCustomersMerge, useCustomersRemove, useCustomersTag } from './useCustomers';

/** Actions on the selected rows, at the bottom of the screen (old core-ui). */
export const CustomersCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const { user } = useSession();
  const { confirm } = useConfirm();
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const { t: tContact } = useTranslation('contact', { keyPrefix: 'customer' });
  const { openRecord } = useSidePanel();
  const remove = useCustomersRemove();
  const tag = useCustomersTag();
  const merge = useCustomersMerge();
  const [open, setOpen] = useState(false);
  const [merging, setMerging] = useState(false);
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const customers = selectedRows.map((row) => row.original as Customer);
  const customerIds = customers.map((customer) => customer.id);
  const tagIds = commonTagIds(customers);
  // Owners and admins merge and delete (core's rule).
  const manager = user.role !== 'member';

  return (
    <>
      <CommandBar open={selectedRows.length > 0 && !merging}>
        <CommandBar.Bar>
          <CommandBar.Value>
            {tContact('selected', { selectedCount: selectedRows.length })}
          </CommandBar.Value>
          <Separator.Inline />
          <TagsSelect
            type="customer"
            mode="multiple"
            variant="secondary"
            className="shadow-none"
            value={tagIds}
            onValueChange={(next) => tag.mutate({ ids: customerIds, ...tagChange(tagIds, next) })}
          />
          <Separator.Inline />
          <CustomersChangeState customers={customers} />
          {manager && (
            <>
              <Separator.Inline />
              <MergeButton
                label={tContact('action-merge')}
                tooltip={tContact('merge-tooltip')}
                disabled={selectedRows.length !== 2}
                onClick={() => setMerging(true)}
              />
              <Separator.Inline />
              <Popover open={open} onOpenChange={setOpen}>
                <Popover.Trigger asChild>
                  <Button variant="secondary">
                    <IconRepeat />
                    {t('actions')}
                  </Button>
                </Popover.Trigger>
                <Popover.Content
                  className="min-w-[280px] p-0"
                  align="end"
                  side="top"
                  sideOffset={10}
                >
                  <Command>
                    <Command.List className="p-0">
                      <Command.Group className="p-1">
                        <Command.Item
                          className="text-destructive"
                          onSelect={() => {
                            setOpen(false);
                            void confirm({
                              message: tContact('confirm-delete-selected', {
                                count: customerIds.length,
                              }),
                            }).then(() =>
                              remove.mutate(customerIds, {
                                onSuccess: () => table.setRowSelection({}),
                              }),
                            );
                          }}
                        >
                          <IconTrash />
                          {tContact('action-delete')}
                        </Command.Item>
                      </Command.Group>
                    </Command.List>
                  </Command>
                </Popover.Content>
              </Popover>
            </>
          )}
        </CommandBar.Bar>
      </CommandBar>
      <MergeDialog
        open={merging}
        onOpenChange={setMerging}
        noun="customers"
        merging={merge.isPending}
        records={customers.map((customer) => ({
          id: customer.id,
          title: customerTitle(customer) || 'Unnamed',
          details: [
            customer.primaryEmail ?? '',
            customer.primaryPhone ?? '',
            customer.state === 'lead' ? 'Lead' : '',
          ],
        }))}
        onMerge={(keepId) =>
          merge.mutate(
            { ids: customerIds, keepId },
            {
              onSuccess: (customer) => {
                setMerging(false);
                table.resetRowSelection(true);
                openRecord({ contentType: 'core:customer', contentId: customer.id });
              },
            },
          )
        }
      />
    </>
  );
};
