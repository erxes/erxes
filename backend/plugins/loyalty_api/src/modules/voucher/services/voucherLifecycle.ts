import { IVoucher, IVoucherTarget } from '@/voucher/@types/voucher';
import { VOUCHER_STATUS } from '@/voucher/constants';

type TVoucherState = Pick<IVoucher, 'status' | 'usedIn'>;

/** `apply` changes the voucher; `noop` means it is already where asked. */
export type TVoucherStep = 'apply' | 'noop';

const isFor = (voucher: TVoucherState, target?: IVoucherTarget) =>
  !!target?.targetId && voucher.usedIn?.targetId === target.targetId;

const refusal = (voucher: TVoucherState) => {
  switch (voucher.status) {
    case VOUCHER_STATUS.ONHOLD:
      return 'Voucher is held by another order';
    case VOUCHER_STATUS.LOSS:
      return 'Voucher is already used';
    case VOUCHER_STATUS.CANCELLED:
      return 'Voucher is cancelled';
    default:
      return `Voucher is ${voucher.status}`;
  }
};

/** Picking it on an order: only a free voucher, or one already held there. */
export const holdStep = (
  voucher: TVoucherState,
  target: IVoucherTarget,
): TVoucherStep => {
  if (voucher.status === VOUCHER_STATUS.NEW) {
    return 'apply';
  }

  if (voucher.status === VOUCHER_STATUS.ONHOLD && isFor(voucher, target)) {
    return 'noop';
  }

  throw new Error(refusal(voucher));
};

/** Taking it off an order frees it; a paid order can only be returned. */
export const releaseStep = (
  voucher: TVoucherState,
  target: IVoucherTarget,
): TVoucherStep => {
  if (voucher.status === VOUCHER_STATUS.NEW) {
    return 'noop';
  }

  if (voucher.status === VOUCHER_STATUS.ONHOLD && isFor(voucher, target)) {
    return 'apply';
  }

  throw new Error(refusal(voucher));
};

/** Paying the order uses it; another sync of the same order changes nothing. */
export const useStep = (
  voucher: TVoucherState,
  target?: IVoucherTarget,
): TVoucherStep => {
  if (voucher.status === VOUCHER_STATUS.LOSS && isFor(voucher, target)) {
    return 'noop';
  }

  if (voucher.status === VOUCHER_STATUS.NEW) {
    return 'apply';
  }

  if (voucher.status === VOUCHER_STATUS.ONHOLD && isFor(voucher, target)) {
    return 'apply';
  }

  throw new Error(refusal(voucher));
};

/** Whether this voucher may be priced into this order. */
export const mayApplyTo = (voucher: TVoucherState, targetId?: string) =>
  voucher.status === VOUCHER_STATUS.NEW ||
  ([VOUCHER_STATUS.ONHOLD, VOUCHER_STATUS.LOSS].includes(
    voucher.status || '',
  ) &&
    !!targetId &&
    voucher.usedIn?.targetId === targetId);

export { refusal as voucherRefusal };
