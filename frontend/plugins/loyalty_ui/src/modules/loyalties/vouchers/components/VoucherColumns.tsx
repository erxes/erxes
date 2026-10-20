import {
  IconCalendarDue,
  IconClock,
  IconGift,
  IconMapPin,
  IconTag,
  IconUser,
} from '@tabler/icons-react';
import { ColumnDef } from '@tanstack/table-core';
import { format } from 'date-fns';
import {
  RecordTable,
  RecordTableInlineCell,
  RelativeDateDisplay,
} from 'erxes-ui';
import { TFunction } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IVoucher } from '@/loyalties/vouchers/types/voucher';
import {
  voucherDaysLeft,
  voucherDisplayStatus,
  voucherGivesText,
  voucherWhereText,
} from '@/loyalties/vouchers/utils/voucherView';
import { VoucherDetailSheet } from './detail/VoucherDetailSheet';
import { VoucherOwner } from './VoucherOwner';
import { VoucherStatusBadge } from './VoucherStatusBadge';

// Opening the voucher is the way to act on it; there is no free edit.
const RecipientCell = ({ voucher }: { voucher: IVoucher }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <RecordTableInlineCell
        className="cursor-pointer hover:underline"
        onClick={() => setOpen(true)}
      >
        <VoucherOwner ownerId={voucher.ownerId} ownerType={voucher.ownerType} />
      </RecordTableInlineCell>
      {open && (
        <VoucherDetailSheet
          voucher={voucher}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </>
  );
};

const GivesCell = ({ voucher }: { voucher: IVoucher }) => {
  const { t } = useTranslation('loyalty');

  return (
    <RecordTableInlineCell className="gap-1.5">
      <span className="truncate">{voucher.terms?.title || '—'}</span>
      <span className="shrink-0 text-xs text-muted-foreground">
        {voucherGivesText(voucher, t)}
      </span>
    </RecordTableInlineCell>
  );
};

const ValidUntilCell = ({ voucher }: { voucher: IVoucher }) => {
  const { t } = useTranslation('loyalty');
  const status = voucherDisplayStatus(voucher);
  const daysLeft = voucherDaysLeft(voucher.expiresAt);

  if (!voucher.expiresAt) {
    return (
      <RecordTableInlineCell className="text-muted-foreground">
        {t('voucher-no-end')}
      </RecordTableInlineCell>
    );
  }

  return (
    <RecordTableInlineCell className="gap-1.5">
      <span>{format(new Date(voucher.expiresAt), 'yyyy.MM.dd')}</span>
      {(status === 'new' || status === 'onhold') && daysLeft !== null && (
        <span
          className={
            daysLeft <= 3
              ? 'text-xs text-warning'
              : 'text-xs text-muted-foreground'
          }
        >
          {t('voucher-days-left', { count: daysLeft })}
        </span>
      )}
    </RecordTableInlineCell>
  );
};

export const voucherColumns = (
  t: TFunction<'loyalty'>,
): ColumnDef<IVoucher>[] => [
  {
    id: 'recipient',
    accessorKey: 'ownerId',
    header: () => (
      <RecordTable.InlineHead icon={IconUser} label={t('voucher-recipient')} />
    ),
    cell: ({ row }) => <RecipientCell voucher={row.original} />,
    size: 200,
  },
  {
    id: 'gives',
    accessorKey: 'terms',
    header: () => (
      <RecordTable.InlineHead icon={IconGift} label={t('voucher-gives')} />
    ),
    cell: ({ row }) => <GivesCell voucher={row.original} />,
    size: 200,
  },
  {
    id: 'expiresAt',
    accessorKey: 'expiresAt',
    header: () => (
      <RecordTable.InlineHead
        icon={IconCalendarDue}
        label={t('voucher-valid-until')}
      />
    ),
    cell: ({ row }) => <ValidUntilCell voucher={row.original} />,
    size: 140,
  },
  {
    id: 'status',
    accessorKey: 'status',
    header: () => <RecordTable.InlineHead icon={IconTag} label={t('status')} />,
    cell: ({ row }) => (
      <RecordTableInlineCell>
        <VoucherStatusBadge status={voucherDisplayStatus(row.original)} />
      </RecordTableInlineCell>
    ),
    size: 110,
  },
  {
    id: 'createdAt',
    accessorKey: 'createdAt',
    header: () => (
      <RecordTable.InlineHead icon={IconClock} label={t('voucher-received')} />
    ),
    cell: ({ row }) => (
      <RelativeDateDisplay value={row.original.createdAt as string} asChild>
        <RecordTableInlineCell className="text-xs text-muted-foreground">
          <RelativeDateDisplay.Value value={row.original.createdAt as string} />
        </RecordTableInlineCell>
      </RelativeDateDisplay>
    ),
    size: 130,
  },
  {
    id: 'usedIn',
    accessorKey: 'usedIn',
    header: () => (
      <RecordTable.InlineHead
        icon={IconMapPin}
        label={t('voucher-where-col')}
      />
    ),
    cell: ({ row }) => (
      <RecordTableInlineCell className="text-xs text-muted-foreground">
        {voucherWhereText(row.original, t) || '—'}
      </RecordTableInlineCell>
    ),
    size: 140,
  },
];
