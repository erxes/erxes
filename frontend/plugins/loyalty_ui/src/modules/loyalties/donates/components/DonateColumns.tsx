import { IconUser, IconTag, IconClock } from '@tabler/icons-react';
import { isValid } from 'date-fns';
import { ColumnDef } from '@tanstack/table-core';
import {
  RecordTable,
  RecordTableInlineCell,
  Badge,
  RelativeDateDisplay,
} from 'erxes-ui';
import { useState } from 'react';

import { IDonate } from '../types/donate';
import { CustomersInline } from 'ui-modules/modules/contacts/components/CustomersInline';
import { CompaniesInline } from 'ui-modules/modules/contacts/components/CompaniesInline';
import { MembersInline } from 'ui-modules';
import { DonateEditSheet } from './DonateEditSheet';

const CreatedAtCell = ({ donate }: { donate: IDonate }) => {
  const [open, setOpen] = useState(false);
  const dateValid = donate.createdAt && isValid(new Date(donate.createdAt));

  return (
    <>
      <RelativeDateDisplay value={donate.createdAt as string} asChild>
        <RecordTableInlineCell
          className="text-xs font-medium text-muted-foreground cursor-pointer hover:underline"
          onClick={() => setOpen(true)}
        >
          {dateValid ? (
            <RelativeDateDisplay.Value value={donate.createdAt as string} />
          ) : (
            '—'
          )}
        </RecordTableInlineCell>
      </RelativeDateDisplay>
      {open && (
        <DonateEditSheet donate={donate} open={open} onOpenChange={setOpen} />
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
      ) : ownerType === 'user' ? (
        <MembersInline memberIds={[ownerId]} placeholder="—" />
      ) : (
        <CustomersInline customerIds={[ownerId]} placeholder="—" />
      )}
    </RecordTableInlineCell>
  );
};

export const firstDonateColumns: ColumnDef<IDonate>[] = [
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead icon={IconClock} label="Created At" />
    ),
    size: 100,
    cell: ({ row }) => <CreatedAtCell donate={row.original} />,
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

export const secondDonateColumns: ColumnDef<IDonate>[] = [
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

export const donateColumns: ColumnDef<IDonate>[] = [
  ...firstDonateColumns,
  ...secondDonateColumns,
];
