import { format } from 'date-fns';
import { Badge, Button, Dialog, Input } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TDealVouchers } from '../hooks/useDealVouchers';

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1.5 border-t pt-3">
    <div className="text-xs font-medium text-muted-foreground">{title}</div>
    {children}
  </div>
);

/** Everything the deal's customer could use, opened from the voucher row. */
export const DealVoucherDialog = ({
  open,
  onOpenChange,
  vouchers,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vouchers: TDealVouchers;
}) => {
  const { t } = useTranslation('sales');
  const [code, setCode] = useState('');
  const {
    groups,
    saving,
    toggleVoucher,
    couponCode,
    applyCoupon,
    clearCoupon,
  } = vouchers;

  const submitCoupon = async () => {
    if ((await applyCoupon(code)) !== null) setCode('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="max-w-md">
        <Dialog.Header>
          <Dialog.Title>{t('deal-voucher-title')}</Dialog.Title>
        </Dialog.Header>

        <Section title={t('deal-voucher-vouchers')}>
          {groups.length ? (
            groups.map((group) => (
              <div
                key={group.key}
                className="flex items-start justify-between gap-2 text-sm"
              >
                <div className="min-w-0">
                  <div
                    className={
                      group.applicable
                        ? 'truncate font-medium'
                        : 'truncate font-medium text-muted-foreground'
                    }
                  >
                    {group.title} {group.valueText}
                    {group.count > 1 && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ×{group.count}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {group.expiresAt &&
                      t('deal-voucher-until', {
                        date: format(new Date(group.expiresAt), 'yyyy.MM.dd'),
                      })}
                    {group.reason && (
                      <span className="text-destructive">
                        {' '}
                        · {group.reason}
                      </span>
                    )}
                  </div>
                </div>
                {group.autoApplied ? (
                  <Badge variant="secondary">{t('deal-voucher-auto')}</Badge>
                ) : (
                  <Button
                    size="sm"
                    variant={group.selected ? 'default' : 'outline'}
                    disabled={saving || !group.applicable}
                    onClick={() => toggleVoucher(group.voucherId)}
                  >
                    {group.selected
                      ? t('deal-voucher-applied')
                      : t('deal-voucher-apply')}
                  </Button>
                )}
              </div>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">
              {t('deal-voucher-none')}
            </span>
          )}
        </Section>

        <Section title={t('deal-voucher-coupon')}>
          {couponCode ? (
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="font-medium">{couponCode}</span>
              <Button
                size="sm"
                variant="outline"
                disabled={saving}
                onClick={clearCoupon}
              >
                {t('deal-voucher-remove')}
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Input
                value={code}
                placeholder={t('deal-voucher-coupon-placeholder')}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitCoupon()}
              />
              <Button
                variant="outline"
                disabled={saving || !code.trim()}
                onClick={submitCoupon}
              >
                {t('deal-voucher-apply')}
              </Button>
            </div>
          )}
        </Section>
      </Dialog.Content>
    </Dialog>
  );
};
