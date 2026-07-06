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
import { TFunction } from 'i18next';

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

const renderOwnerContent = (ownerId: string, ownerType?: string) => {
  if (ownerType === 'company')
    return <CompaniesInline companyIds={[ownerId]} placeholder="—" />;
  if (ownerType === 'user')
    return <MembersInline memberIds={[ownerId]} placeholder="—" />;
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

export const firstDonateColumns = (
  t: TFunction<'loyalty'>,
): ColumnDef<IDonate>[] => [
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => {
      return (
        <RecordTable.InlineHead icon={IconClock} label={t('created-at', 'Created At')} />
      );
    },
    size: 100,
    cell: ({ row }) => <CreatedAtCell donate={row.original} />,
  },
  {
    id: 'ownerType',
    accessorKey: 'ownerType',
    header: () => (
      <RecordTable.InlineHead icon={IconUser} label={t('owner-type', 'Owner Type')} />
    ),
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <span className="capitalize">{t(cell.getValue() as string)}</span>
        </RecordTableInlineCell>
      );
    },
    size: 130,
  },
];

export const secondDonateColumns = (
  t: TFunction<'loyalty'>,
): ColumnDef<IDonate>[] => [
  {
    id: 'ownerId',
    accessorKey: 'ownerId',
    header: () => <RecordTable.InlineHead icon={IconUser} label={t('owner', 'Owner')} />,
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
    header: () => <RecordTable.InlineHead icon={IconTag} label={t('status', 'Status')} />,
    cell: ({ cell }) => {
      return (
        <RecordTableInlineCell>
          <Badge variant="default">{t(cell.getValue() as string)}</Badge>
        </RecordTableInlineCell>
      );
    },
    size: 60,
  },
];

export const donateColumns = (
  t: TFunction<'loyalty'>,
): ColumnDef<IDonate>[] => [
  ...firstDonateColumns(t),
  ...secondDonateColumns(t),
];
