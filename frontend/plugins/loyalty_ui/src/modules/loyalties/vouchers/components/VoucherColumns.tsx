import { IconUser, IconTag, IconClock } from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import { useQuery } from '@apollo/client';
import {
  RecordTable,
  RecordTableInlineCell,
  Badge,
  RelativeDateDisplay,
} from 'erxes-ui';
import type { TFunction } from 'i18next';
import { useState } from 'react';

import { IVoucher } from '@/loyalties/vouchers/types/voucher';
import { VOUCHER_CP_USER_QUERY } from '@/loyalties/vouchers/graphql/queries/queries';
import { CustomersInline } from 'ui-modules/modules/contacts/components/CustomersInline';
import { CompaniesInline } from 'ui-modules/modules/contacts/components/CompaniesInline';
import { MembersInline } from 'ui-modules';
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

// Client portal users have no inline component in `ui-modules`, so resolve them
// here: prefer the linked erxes customer (matching the backend `getLoyaltyOwner`
// behaviour) and otherwise fall back to the client portal user's own name.
const CpUserOwner = ({ ownerId }: { ownerId: string }) => {
  const { data, loading } = useQuery(VOUCHER_CP_USER_QUERY, {
    variables: { _id: ownerId },
    skip: !ownerId,
  });

  const cpUser = data?.getClientPortalUser;

  if (cpUser?.erxesCustomerId) {
    return (
      <CustomersInline customerIds={[cpUser.erxesCustomerId]} placeholder="—" />
    );
  }

  if (loading) return <>—</>;

  const name =
    [cpUser?.firstName, cpUser?.lastName].filter(Boolean).join(' ') ||
    cpUser?.email ||
    cpUser?.phone;

  return <>{name || '—'}</>;
};

const renderOwnerContent = (ownerId: string, ownerType?: string) => {
  if (ownerType === 'company')
    return <CompaniesInline companyIds={[ownerId]} placeholder="—" />;
  if (ownerType === 'user')
    return <MembersInline memberIds={[ownerId]} placeholder="—" />;
  if (ownerType === 'cpUser') return <CpUserOwner ownerId={ownerId} />;
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

export const firstVoucherColumns = (t: TFunction): ColumnDef<IVoucher>[] => [
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead icon={IconClock} label={t('created-at')} />
    ),
    cell: ({ row }) => <CreatedAtCell voucher={row.original} />,
  },
  {
    id: 'ownerType',
    accessorKey: 'ownerType',
    header: () => (
      <RecordTable.InlineHead icon={IconUser} label={t('owner-type')} />
    ),
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <span className="capitalize">{t(cell.getValue() as string)}</span>
      </RecordTableInlineCell>
    ),
    size: 130,
  },
];

export const secondVoucherColumns = (t: TFunction): ColumnDef<IVoucher>[] => [
  {
    id: 'ownerId',
    accessorKey: 'ownerId',
    header: () => <RecordTable.InlineHead icon={IconUser} label={t('owner')} />,
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
    header: () => <RecordTable.InlineHead icon={IconTag} label={t('status')} />,
    cell: ({ cell }) => (
      <RecordTableInlineCell>
        <Badge variant="default">{t(cell.getValue() as string)}</Badge>
      </RecordTableInlineCell>
    ),
    size: 100,
  },
];

export const voucherColumns = (t: TFunction): ColumnDef<IVoucher>[] => [
  ...firstVoucherColumns(t),
  ...secondVoucherColumns(t),
];
