import { TFunction } from 'i18next';
import { IVoucher, TVoucherStatus } from '../types/voucher';

const OPEN_STATUSES = ['new', 'onhold'];

/** The status a person reads: an open voucher past its end is expired. */
export const voucherDisplayStatus = (
  voucher: Pick<IVoucher, 'status' | 'expiresAt'>,
  now = new Date(),
): TVoucherStatus => {
  const status = (voucher.status || 'new') as TVoucherStatus;

  if (
    OPEN_STATUSES.includes(status) &&
    voucher.expiresAt &&
    new Date(voucher.expiresAt) < now
  ) {
    return 'expired';
  }

  return status;
};

/** What one voucher gives, in a few words. */
export const voucherGivesText = (
  voucher: Pick<IVoucher, 'terms'>,
  t: TFunction<'loyalty'>,
) => {
  const { voucherType, kind, value, bonusCount } = voucher.terms || {};

  if (voucherType === 'bonus') {
    return t('voucher-gives-bonus', { count: bonusCount || 1 });
  }

  if (!value) {
    return '';
  }

  return kind === 'percent'
    ? t('voucher-gives-percent', { value })
    : t('voucher-gives-amount', { value: value.toLocaleString() });
};

/** What the voucher may be used on, as one line. */
export const voucherAppliesText = (
  voucher: Pick<IVoucher, 'terms'>,
  t: TFunction<'loyalty'>,
) => {
  const {
    minimumSpend,
    maximumSpend,
    productIds = [],
    categoryIds = [],
    tag = [],
  } = voucher.terms?.restrictions || {};

  const parts = [
    productIds.length &&
      t('voucher-applies-products', { count: productIds.length }),
    categoryIds.length &&
      t('voucher-applies-categories', { count: categoryIds.length }),
    tag.length && t('voucher-applies-tags', { count: tag.length }),
    minimumSpend &&
      t('voucher-applies-min', { value: minimumSpend.toLocaleString() }),
    maximumSpend &&
      t('voucher-applies-max', { value: maximumSpend.toLocaleString() }),
  ].filter(Boolean);

  return parts.length ? parts.join(' · ') : t('voucher-applies-anything');
};

/** Where it was held or used: a POS order, a deal, or a note for manual use. */
export const voucherWhereText = (
  voucher: Pick<IVoucher, 'usedIn'>,
  t: TFunction<'loyalty'>,
) => {
  const { targetType, note } = voucher.usedIn || {};

  if (!targetType) {
    return '';
  }

  if (targetType === 'manual') {
    return note || t('voucher-where.manual');
  }

  return t(`voucher-where.${targetType}`, { defaultValue: targetType });
};

/** Days left until it ends, when it ends at all. */
export const voucherDaysLeft = (
  expiresAt?: string | null,
  now = new Date(),
) => {
  if (!expiresAt) {
    return null;
  }

  return Math.ceil(
    (new Date(expiresAt).getTime() - now.getTime()) / (24 * 60 * 60 * 1000),
  );
};
