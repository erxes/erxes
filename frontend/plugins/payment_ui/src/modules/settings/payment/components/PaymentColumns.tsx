import { usePaymentRemove } from '@/payment/hooks/usePaymentRemove';
import { IPayment, IPaymentDocument } from '@/payment/types/Payment';
import { paymentKind } from '@/payment/utils';
import {
  IconCalendarPlus,
  IconEdit,
  IconHash,
  IconKey,
  IconProgress,
  IconSettings,
  IconTrash,
} from '@tabler/icons-react';
import { Cell } from '@tanstack/react-table';
import { ColumnDef } from '@tanstack/table-core';
import {
  Badge,
  Combobox,
  Command,
  Popover,
  REACT_APP_API_URL,
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
  Sheet,
  TextOverflowTooltip,
} from 'erxes-ui';
import { useState } from 'react';
import PaymentForm from './PaymentForm';

export const paymentColumns: ColumnDef<IPayment>[] = [
  {
    id: 'more',
    cell: ({ cell }: { cell: Cell<IPayment, unknown> }) => {
      const payment = cell.row.original as IPaymentDocument;

      const [open, setOpen] = useState(false);

      const { removePayment } = usePaymentRemove();

      return (
        <>
          <Popover>
            <Popover.Trigger asChild>
              <RecordTable.MoreButton className="w-full h-full" />
            </Popover.Trigger>
            <Combobox.Content className="w-30 min-w-30">
              <Command shouldFilter={false}>
                <Command.List>
                  <Command.Item value="edit" onSelect={() => setOpen(true)}>
                    <IconEdit className="w-4 h-4" />
                    Edit
                  </Command.Item>

                  <Command.Item
                    value="delete"
                    onSelect={() =>
                      removePayment({ variables: { _ids: [payment._id] } })
                    }
                  >
                    <IconTrash /> Delete
                  </Command.Item>
                </Command.List>
              </Command>
            </Combobox.Content>
          </Popover>

          <Sheet open={open} onOpenChange={setOpen} modal>
            <Sheet.View className="p-0 sm:max-w-lg">
              <PaymentForm payment={payment} onCancel={() => setOpen(false)} />
            </Sheet.View>
          </Sheet>
        </>
      );
    },
    size: 33,
  },
  RecordTable.checkboxColumn as ColumnDef<IPayment>,
  {
    id: 'kind',
    accessorKey: 'kind',
    header: () => (
      <RecordTable.InlineHead label="Payment Method" icon={IconSettings} />
    ),
    cell: ({ cell }) => {
      const kind = cell.getValue() as string;

      const logoUrl = `${REACT_APP_API_URL}/pl:payment/static/images/payments/${kind}.png`;

      return (
        <RecordTableInlineCell>
          <img
            className="rounded-md w-5 h-5 object-contain"
            src={logoUrl}
            alt={paymentKind(kind)?.name}
          />

          {paymentKind(kind)?.name}
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: () => <RecordTable.InlineHead label="Name" icon={IconHash} />,
    cell: ({ cell }) => {
      const payment = cell.row.original;
      const [open, setOpen] = useState(false);

      return (
        <RecordTableInlineCell>
          <Sheet open={open} onOpenChange={setOpen} modal>
            <Sheet.Trigger asChild>
              <Badge variant="secondary" className="cursor-pointer">
                <TextOverflowTooltip value={cell.getValue() as string} />
              </Badge>
            </Sheet.Trigger>
            <Sheet.View className="p-0 sm:max-w-lg">
              <PaymentForm payment={payment} onCancel={() => setOpen(false)} />
            </Sheet.View>
          </Sheet>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <RecordTable.InlineHead label="Status" icon={IconProgress} />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <Badge>{cell.getValue() as string}</Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'credentials',
    accessorKey: 'credentials',
    header: () => <RecordTable.InlineHead label="Credentials" icon={IconKey} />,
    cell: () => {
      return (
        <RecordTableInlineCell>
          <Badge variant="secondary">{'******'}</Badge>
        </RecordTableInlineCell>
      );
    },
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead label="Created At" icon={IconCalendarPlus} />
    ),
    cell: ({ cell }) => {
      return (
        <RelativeDateDisplay value={cell.getValue() as string} asChild>
          <RecordTableInlineCell>
            <RelativeDateDisplay.Value value={cell.getValue() as string} />
          </RecordTableInlineCell>
        </RelativeDateDisplay>
      );
    },
  },
];
