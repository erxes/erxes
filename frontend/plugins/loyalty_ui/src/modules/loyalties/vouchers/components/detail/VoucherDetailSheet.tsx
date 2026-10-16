import { IconBan, IconCalendarPlus, IconCheck } from '@tabler/icons-react';
import { format } from 'date-fns';
import { Button, DatePicker, Sheet, Textarea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useVoucherDetail } from '../../hooks/useVoucherDetail';
import { IVoucher } from '../../types/voucher';
import {
  voucherAppliesText,
  voucherGivesText,
  voucherWhereText,
} from '../../utils/voucherView';
import { VoucherOwner } from '../VoucherOwner';
import { VoucherStatusBadge } from '../VoucherStatusBadge';

const formatDate = (value?: string | null) =>
  value ? format(new Date(value), 'yyyy.MM.dd HH:mm') : '';

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-xs text-muted-foreground">{label}</span>
    <div className="text-sm">{children}</div>
  </div>
);

/** One issued voucher: what it gives, where it stands, and its history. */
export const VoucherDetailSheet = ({
  voucher,
  open,
  onOpenChange,
}: {
  voucher: IVoucher;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const { t } = useTranslation('loyalty');
  const detail = useVoucherDetail(voucher);
  const { status, canAct, canExtend, action, choose } = detail;
  const where = voucherWhereText(voucher, t);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <Sheet.View className="sm:max-w-md p-0">
        <Sheet.Header>
          <Sheet.Title>
            {voucher.terms?.title || t('voucher')}{' '}
            <span className="text-muted-foreground font-normal">
              {voucherGivesText(voucher, t)}
            </span>
          </Sheet.Title>
          <Sheet.Close />
        </Sheet.Header>
        <Sheet.Content className="flex flex-col gap-4 p-5 overflow-y-auto">
          <div className="flex items-center justify-between gap-2">
            <VoucherOwner
              ownerId={voucher.ownerId}
              ownerType={voucher.ownerType}
            />
            <VoucherStatusBadge status={status} />
          </div>

          <Field label={t('voucher-applies')}>
            {voucherAppliesText(voucher, t)}
          </Field>
          <Field label={t('voucher-valid')}>
            {formatDate(voucher.createdAt)} →{' '}
            {voucher.expiresAt
              ? formatDate(voucher.expiresAt)
              : t('voucher-no-end')}
          </Field>
          {where && (
            <Field
              label={
                status === 'onhold'
                  ? t('voucher-held-in')
                  : t('voucher-used-in')
              }
            >
              {where}
              {voucher.usedIn?.targetId && (
                <span className="text-muted-foreground">
                  {' '}
                  · {voucher.usedIn.targetId}
                </span>
              )}
            </Field>
          )}
          {voucher.cancelReason && (
            <Field label={t('voucher-cancel-reason')}>
              {voucher.cancelReason}
            </Field>
          )}

          <Field label={t('voucher-history')}>
            {voucher.history?.length ? (
              <ol className="flex flex-col gap-1.5 border-l pl-3">
                {voucher.history.map((entry, index) => (
                  <li key={`${entry.action}-${index}`}>
                    <div>
                      {t(`voucher-history-action.${entry.action}`, {
                        defaultValue: entry.action,
                      })}
                      {entry.note && (
                        <span className="text-muted-foreground">
                          {' '}
                          · {entry.note}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(entry.at)}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <span className="text-muted-foreground">
                {t('voucher-history-none')}
              </span>
            )}
          </Field>

          {(canAct || canExtend) && (
            <div className="flex flex-col gap-2 border-t pt-4">
              <div className="flex flex-wrap gap-2">
                {canAct && (
                  <Button
                    variant={action === 'markUsed' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() =>
                      choose(action === 'markUsed' ? null : 'markUsed')
                    }
                  >
                    <IconCheck />
                    {t('voucher-mark-used')}
                  </Button>
                )}
                {canExtend && (
                  <Button
                    variant={action === 'extend' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() =>
                      choose(action === 'extend' ? null : 'extend')
                    }
                  >
                    <IconCalendarPlus />
                    {t('voucher-extend')}
                  </Button>
                )}
                {canAct && (
                  <Button
                    variant={action === 'cancel' ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() =>
                      choose(action === 'cancel' ? null : 'cancel')
                    }
                  >
                    <IconBan />
                    {t('voucher-cancel')}
                  </Button>
                )}
              </div>

              {action === 'extend' && (
                <DatePicker
                  value={detail.endDate}
                  onChange={(date) =>
                    detail.setEndDate(date instanceof Date ? date : undefined)
                  }
                  minDate={new Date()}
                  placeholder={t('voucher-extend-until')}
                />
              )}
              {(action === 'markUsed' || action === 'cancel') && (
                <Textarea
                  value={detail.text}
                  onChange={(e) => detail.setText(e.target.value)}
                  placeholder={
                    action === 'cancel'
                      ? t('voucher-cancel-reason-placeholder')
                      : t('voucher-mark-used-placeholder')
                  }
                />
              )}
              {action && (
                <Button
                  className="self-end"
                  size="sm"
                  variant={action === 'cancel' ? 'destructive' : 'default'}
                  disabled={!detail.ready || detail.loading}
                  onClick={detail.submit}
                >
                  {t(`voucher-action-confirm.${action}`)}
                </Button>
              )}
            </div>
          )}
        </Sheet.Content>
      </Sheet.View>
    </Sheet>
  );
};
