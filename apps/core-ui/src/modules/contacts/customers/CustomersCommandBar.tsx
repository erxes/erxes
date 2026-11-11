import type { Customer, CustomerState } from '@erxes/core-contract';
import { IconArrowMerge, IconArrowsExchange, IconTrash } from '@tabler/icons-react';
import { Button, CommandBar, RecordTable, Separator, useConfirm, useQueryState } from 'erxes-ui';
import { useState } from 'react';
import { useSession } from '~/modules/auth/session';
import { BulkTagButton } from '~/modules/tags/BulkTagButton';
import { MergeDialog } from '../components/MergeDialog';
import {
  CUSTOMER_SHEET_PARAM,
  customerName,
  useCustomerEdit,
  useCustomersMerge,
  useCustomersRemove,
  useCustomersTag,
} from './useCustomers';

/** Actions on the selected rows, at the bottom of the screen (old core-ui). */
export const CustomersCommandBar = () => {
  const { table } = RecordTable.useRecordTable();
  const { user } = useSession();
  const { confirm } = useConfirm();
  const remove = useCustomersRemove();
  const edit = useCustomerEdit();
  const tag = useCustomersTag();
  const merge = useCustomersMerge();
  const [, setOpenId] = useQueryState<string>(CUSTOMER_SHEET_PARAM);
  const [merging, setMerging] = useState(false);
  const rows = table.getFilteredSelectedRowModel().rows;
  const customers = rows.map((row) => row.original as Customer);
  const ids = customers.map((customer) => customer.id);
  const manager = user.role !== 'member';
  const target: CustomerState = customers.every((customer) => customer.state === 'lead') ? 'customer' : 'lead';

  const done = () => table.resetRowSelection();

  return (
    <>
      <CommandBar open={rows.length > 0 && !merging}>
        <CommandBar.Bar>
          <CommandBar.Value onClose={done}>{rows.length} selected</CommandBar.Value>
          <Separator.Inline />
          <BulkTagButton type="customer" records={customers} onChange={(change) => tag.mutate({ ids, ...change })} />
          <Button
            variant="secondary"
            onClick={async () => {
              await Promise.all(ids.map((id) => edit.mutateAsync({ id, state: target })));
              done();
            }}
          >
            <IconArrowsExchange />
            Move to {target === 'lead' ? 'leads' : 'customers'}
          </Button>
          {manager && (
            <>
              <Button variant="secondary" disabled={rows.length < 2 || rows.length > 10} onClick={() => setMerging(true)}>
                <IconArrowMerge />
                Merge
              </Button>
              <Separator.Inline />
              <Button
                variant="secondary"
                className="text-destructive"
                onClick={() =>
                  confirm({
                    message: `Delete ${rows.length} selected?`,
                    options: { okLabel: 'Delete', variants: { ok: 'destructive' } },
                  }).then(() => remove.mutate(ids, { onSuccess: done }))
                }
              >
                <IconTrash />
                Delete
              </Button>
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
          title: customerName(customer) || customer.primaryEmail || customer.primaryPhone || 'Unnamed',
          details: [customer.primaryEmail ?? '', customer.primaryPhone ?? '', customer.state === 'lead' ? 'Lead' : ''],
        }))}
        onMerge={(keepId) =>
          merge.mutate(
            { ids, keepId },
            {
              onSuccess: (customer) => {
                setMerging(false);
                done();
                setOpenId(customer.id);
              },
            },
          )
        }
      />
    </>
  );
};
