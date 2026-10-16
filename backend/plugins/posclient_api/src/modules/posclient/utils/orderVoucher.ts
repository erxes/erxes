import { sendTRPCMessage } from 'erxes-api-shared/utils';

// The target loyalty records a POS order's voucher against; sales confirms
// the paid order with the same pair.
export const POS_VOUCHER_TARGET_TYPE = 'pos';

const askVoucher = async (
  subdomain: string,
  action: 'hold' | 'release',
  input: Record<string, unknown>,
) => {
  const result = await sendTRPCMessage({
    subdomain,
    pluginName: 'loyalty',
    method: 'mutation',
    module: 'voucher',
    action,
    input,
    throwOnError: true,
  });

  // Nothing comes back only when loyalty cannot be reached at all.
  if (!result) {
    throw new Error(
      'Vouchers need a connection to loyalty, which this POS cannot reach right now',
    );
  }

  return result;
};

/**
 * Moves the order's picked voucher with it: the one taken off is freed, the
 * one picked is held for this order so no other till can take it.
 */
export const syncOrderVoucher = async ({
  subdomain,
  orderId,
  previousVoucherId,
  voucherId,
  ownerType,
  ownerId,
  totalAmount,
  userId,
}: {
  subdomain: string;
  orderId: string;
  previousVoucherId?: string;
  voucherId?: string;
  ownerType?: string;
  ownerId?: string;
  totalAmount?: number;
  userId?: string;
}) => {
  const target = { targetType: POS_VOUCHER_TARGET_TYPE, targetId: orderId };

  if (previousVoucherId && previousVoucherId !== voucherId) {
    await askVoucher(subdomain, 'release', {
      voucherId: previousVoucherId,
      target,
      userId,
    });
  }

  if (!voucherId) {
    return;
  }

  if (!ownerId) {
    throw new Error('Choose the customer before using their voucher');
  }

  await askVoucher(subdomain, 'hold', {
    voucherId,
    ownerType: ownerType || 'customer',
    ownerId,
    target,
    totalAmount: Number(totalAmount) || 0,
    userId,
  });
};

/** A cancelled order lets go of whatever it held. */
export const releaseOrderVouchers = (
  subdomain: string,
  orderId: string,
  userId?: string,
) =>
  sendTRPCMessage({
    subdomain,
    pluginName: 'loyalty',
    method: 'mutation',
    module: 'voucher',
    action: 'releaseTarget',
    input: { targetId: orderId, userId },
    defaultValue: 0,
  });
