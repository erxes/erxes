import { IconUser, IconTag, IconClock, IconHash } from '@tabler/icons-react';
import { isValid } from 'date-fns';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  RecordTableInlineCell,
  Badge,
  RelativeDateDisplay,
} from 'erxes-ui';
import { useState } from 'react';

import { ILottery } from '@/loyalties/lotteries/types/lottery';
import { CustomersInline } from 'ui-modules/modules/contacts/components/CustomersInline';
import { CompaniesInline } from 'ui-modules/modules/contacts/components/CompaniesInline';
import { LotteryEditSheet } from './LotteryEditSheet';

const CreatedAtCell = ({ lottery }: { lottery: ILottery }) => {
  const dateValid = lottery.createdAt && isValid(new Date(lottery.createdAt));

  if (!dateValid) {
    return (
      <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
        —
      </RecordTableInlineCell>
    );
  }

  return (
    <RelativeDateDisplay value={lottery.createdAt as string} asChild>
      <RecordTableInlineCell className="text-xs font-medium text-muted-foreground">
        <RelativeDateDisplay.Value value={lottery.createdAt as string} />
      </RecordTableInlineCell>
    </RelativeDateDisplay>
  );
};

const NumberCell = ({ lottery }: { lottery: ILottery }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <RecordTableInlineCell
        className="text-xs font-mono cursor-pointer hover:underline"
        onClick={() => setOpen(true)}
      >
        <span className="text-xs font-mono">{lottery.number || '—'}</span>
      </RecordTableInlineCell>
      {open && (
        <LotteryEditSheet
          lottery={lottery}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </>
  );
};

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

export const firstLotteryColumns: ColumnDef<ILottery>[] = [
  {
    id: 'number',
    accessorKey: 'number',
    header: () => <RecordTable.InlineHead icon={IconHash} label="Number" />,
    cell: ({ row }) => <NumberCell lottery={row.original} />,
    size: 300,
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead icon={IconClock} label="Created At" />
    ),
    size: 100,
    cell: ({ row }) => <CreatedAtCell lottery={row.original} />,
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

export const secondLotteryColumns: ColumnDef<ILottery>[] = [
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
    size: 60,
  },
];

export const lotteryColumns: ColumnDef<ILottery>[] = [
  ...firstLotteryColumns,
  ...secondLotteryColumns,
];
