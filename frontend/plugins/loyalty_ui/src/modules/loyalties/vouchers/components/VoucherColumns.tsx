import { IconUser, IconTag, IconClock } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  RecordTableInlineCell,
  Badge,
  RelativeDateDisplay,
} from 'erxes-ui';
import { useState } from 'react';

import { IVoucher } from '@/loyalties/vouchers/types/voucher';
import { CustomersInline } from 'ui-modules/modules/contacts/components/CustomersInline';
import { CompaniesInline } from 'ui-modules/modules/contacts/components/CompaniesInline';
import { VoucherEditSheet } from './VoucherEditSheet';

const CreatedAtCell = ({ voucher }: { voucher: IVoucher }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <RelativeDateDisplay value={voucher.createdAt as string} asChild>
        <RecordTableInlineCell
          className="text-xs font-medium text-muted-foreground cursor-pointer hover:underline"
          onClick={() => setOpen(true)}
        >
          <RelativeDateDisplay.Value value={voucher.createdAt as string} />
        </RecordTableInlineCell>
      </RelativeDateDisplay>
      {open && (
        <VoucherEditSheet
          voucher={voucher}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </>
  );
};

export const generateOtherPaymentColumns = (_summary?: any) => [];

const OwnerCell = ({
  ownerId,
  ownerType,
}: {
  ownerId?: string;
  ownerType?: string;
}) => {
  if (!ownerId) return <RecordTableInlineCell>—</RecordTableInlineCell>;

  return (
    <RecordTableInlineCell>
      {ownerType === 'company' ? (
        <CompaniesInline companyIds={[ownerId]} placeholder="—" />
      ) : (
        <CustomersInline customerIds={[ownerId]} placeholder="—" />
      )}
    </RecordTableInlineCell>
  );
};

export const firstVoucherColumns: ColumnDef<IVoucher>[] = [
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead icon={IconClock} label="Created At" />
    ),
    cell: ({ row }) => <CreatedAtCell voucher={row.original} />,
  },
  {
    id: 'ownerType',
    accessorKey: 'ownerType',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Owner Type" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <span className="capitalize">{cell.getValue() as string}</span>
      </RecordTableInlineCell>
    ),
    size: 130,
  },
];

export const secondVoucherColumns: ColumnDef<IVoucher>[] = [
  {
    id: 'ownerId',
    accessorKey: 'ownerId',
    header: () => <RecordTable.InlineHead icon={IconUser} label="Owner" />,
    cell: ({ row }) => (
      <OwnerCell
        ownerId={row.original.ownerId}
        ownerType={row.original.ownerType}
      />
    ),
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <RecordTable.InlineHead icon={IconTag} label="Status" />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <Badge variant="default">{cell.getValue() as string}</Badge>
      </RecordTableInlineCell>
    ),
    size: 100,
  },
];

export const voucherColumns: ColumnDef<IVoucher>[] = [
  ...firstVoucherColumns,
  ...secondVoucherColumns,
];
