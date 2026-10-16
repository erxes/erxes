import { format } from 'date-fns';
import { Card, Spinner } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useOwnerVouchers } from '../hooks/useOwnerVouchers';
import { IVoucher } from '../types/voucher';
import {
  voucherDisplayStatus,
  voucherGivesText,
  voucherWhereText,
} from '../utils/voucherView';
import { VoucherDetailSheet } from './detail/VoucherDetailSheet';
import { VoucherStatusBadge } from './VoucherStatusBadge';

const VoucherLine = ({ voucher }: { voucher: IVoucher }) => {
  const { t } = useTranslation('loyalty');
  const [open, setOpen] = useState(false);
  const status = voucherDisplayStatus(voucher);

  return (
    <>
      <button
        type="button"
        className="flex w-full items-start justify-between gap-2 py-2 text-left hover:bg-accent/50"
        onClick={() => setOpen(true)}
      >
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium">
            {voucher.terms?.title} {voucherGivesText(voucher, t)}
          </span>
          <span className="block text-xs text-muted-foreground">
            {voucher.expiresAt
              ? t('voucher-until', {
                  date: format(new Date(voucher.expiresAt), 'yyyy.MM.dd'),
                })
              : t('voucher-no-end')}
            {status === 'onhold' && ` · ${voucherWhereText(voucher, t)}`}
          </span>
        </span>
        <VoucherStatusBadge status={status} />
      </button>
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

/** What the owner can still use, on their own record. */
export const OwnerVouchersCard = ({
  ownerId,
  ownerType,
}: {
  ownerId?: string;
  ownerType?: string;
}) => {
  const { t } = useTranslation('loyalty');
  const { loading, open, closedCount } = useOwnerVouchers(
    ownerId || '',
    ownerType || 'customer',
  );

  return (
    <Card className="bg-background px-4 py-3">
      <div className="text-sm font-medium">{t('vouchers')}</div>
      {loading ? (
        <Spinner size="sm" />
      ) : open.length ? (
        <div className="divide-y">
          {open.map((voucher) => (
            <VoucherLine key={voucher._id} voucher={voucher} />
          ))}
        </div>
      ) : (
        <div className="py-2 text-xs text-muted-foreground">
          {t('owner-vouchers-none')}
        </div>
      )}
      {closedCount > 0 && (
        <div className="pt-1 text-xs text-muted-foreground">
          {t('owner-vouchers-closed', { count: closedCount })}
        </div>
      )}
    </Card>
  );
};
