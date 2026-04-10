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

import { ISpin } from '@/loyalties/spin/types/spin';
import { CustomersInline } from 'ui-modules/modules/contacts/components/CustomersInline';
import { CompaniesInline } from 'ui-modules/modules/contacts/components/CompaniesInline';
import { MembersInline } from 'ui-modules';
import { SpinEditSheet } from './SpinEditSheet';

const CreatedAtCell = ({ spin }: { spin: ISpin }) => {
  const [open, setOpen] = useState(false);
  const dateValid = spin.createdAt && isValid(new Date(spin.createdAt));

  return (
    <>
      <RelativeDateDisplay value={spin.createdAt as string} asChild>
        <RecordTableInlineCell
          className="text-xs font-medium text-muted-foreground cursor-pointer hover:underline"
          onClick={() => setOpen(true)}
        >
          {dateValid ? (
            <RelativeDateDisplay.Value value={spin.createdAt as string} />
          ) : (
            '—'
          )}
        </RecordTableInlineCell>
      </RelativeDateDisplay>
      {open && <SpinEditSheet spin={spin} open={open} onOpenChange={setOpen} />}
    </>
  );
};

const renderOwnerContent = (ownerId: string, ownerType?: string) => {
  if (ownerType === 'company') return <CompaniesInline companyIds={[ownerId]} placeholder="—" />;
  if (ownerType === 'user') return <MembersInline memberIds={[ownerId]} placeholder="—" />;
  return <CustomersInline customerIds={[ownerId]} placeholder="—" />;
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
      {renderOwnerContent(ownerId, ownerType)}
    </RecordTableInlineCell>
  );
};

export const firstSpinColumns: ColumnDef<ISpin>[] = [
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead icon={IconClock} label="Created At" />
    ),
    size: 100,
    cell: ({ row }) => <CreatedAtCell spin={row.original} />,
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

export const secondSpinColumns: ColumnDef<ISpin>[] = [
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

export const spinColumns: ColumnDef<ISpin>[] = [
  ...firstSpinColumns,
  ...secondSpinColumns,
];
