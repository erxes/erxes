import { IconChevronRight, IconTicket, IconX } from '@tabler/icons-react';
import { Button, Spinner } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IDeal } from '@/deals/types/deals';
import { useDealVouchers } from '../hooks/useDealVouchers';
import { dealVoucherValueText } from '../utils/dealVoucherGroups';
import { DealVoucherDialog } from './DealVoucherDialog';

const Chip = ({
  children,
  onRemove,
  disabled,
}: {
  children: React.ReactNode;
  // Left out where the pick is final.
  onRemove?: () => void;
  disabled?: boolean;
}) => (
  <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
    <IconTicket className="size-3" />
    {children}
    {onRemove && (
      <button type="button" disabled={disabled} onClick={onRemove}>
        <IconX className="size-3" />
      </button>
    )}
  </span>
);

/** One line above the products: the voucher and coupon this deal uses. */
export const DealVoucherRow = ({ deal }: { deal: IDeal }) => {
  const { t } = useTranslation('sales');
  const [open, setOpen] = useState(false);
  const vouchers = useDealVouchers(deal);
  const {
    visible,
    loading,
    saving,
    readOnly,
    chosen,
    voucherId,
    couponCode,
    singlePick,
    morePicks,
    toggleVoucher,
    clearCoupon,
  } = vouchers;

  if (!visible) return null;

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center gap-1.5 rounded-md border px-2 py-1.5 text-xs">
        {loading && <Spinner size="sm" />}
        {voucherId && (
          <Chip
            disabled={saving}
            onRemove={readOnly ? undefined : () => toggleVoucher(voucherId)}
          >
            {chosen
              ? `${chosen.title} ${dealVoucherValueText(chosen)}`
              : t('deal-voucher')}
          </Chip>
        )}
        {couponCode && (
          <Chip disabled={saving} onRemove={readOnly ? undefined : clearCoupon}>
            {couponCode}
          </Chip>
        )}
        {!readOnly && singlePick && (
          <Button
            size="sm"
            variant="outline"
            className="h-6 px-2 text-xs"
            disabled={saving}
            onClick={() => toggleVoucher(singlePick.voucherId)}
          >
            {singlePick.title} {singlePick.valueText} ·{' '}
            {t('deal-voucher-apply')}
          </Button>
        )}
        {!readOnly && morePicks > 0 && (
          <span className="text-muted-foreground">
            {t('deal-voucher-more', { count: morePicks })}
          </span>
        )}
        {!voucherId && !couponCode && !singlePick && !morePicks && !loading && (
          <span className="text-muted-foreground">
            {t('deal-voucher-empty')}
          </span>
        )}
        {readOnly ? (
          <span className="ml-auto text-muted-foreground">
            {t('deal-voucher-settled')}
          </span>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto h-6 px-1.5 text-xs"
            onClick={() => setOpen(true)}
          >
            {t('deal-voucher-open')}
            <IconChevronRight className="size-3" />
          </Button>
        )}
      </div>
      {!readOnly && (
        <DealVoucherDialog
          open={open}
          onOpenChange={setOpen}
          vouchers={vouchers}
        />
      )}
    </>
  );
};
