import { caller, type Db, sourceOf } from '@erxes/core-db';
import { fail, notFound } from '~/http/errors';
import { configOf, configOff, RECEIPT_CURRENCY } from '~/modules/ebarimt/plan';
import { ownReceiptPlugins } from '~/modules/ebarimt/plugins';

/**
 * The eBarimt config an invoice names, checked; null: the default issues. 404 for an unknown
 * one. 400 EBARIMT_CONFIG_OFF for one turned off when the invoice gets a receipt from core
 * (`taxReceipt`, in tögrög, from a caller that doesn't send its own), so none goes missing unseen.
 */
export const ebarimtIdOf = async (
  tx: Db,
  invoice: { ebarimtId?: string; taxReceipt?: boolean; currency: string },
) => {
  if (!invoice.ebarimtId) return null;

  const config = await configOf(tx, invoice.ebarimtId);

  if (!config) throw notFound('eBarimt config');

  if (config.status === 'active') return config.id;

  const getsReceipt =
    invoice.taxReceipt !== false &&
    invoice.currency === RECEIPT_CURRENCY &&
    !(await ownReceiptPlugins(tx, [sourceOf(caller())])).size;

  if (getsReceipt) throw fail('EBARIMT_CONFIG_OFF', configOff(config));

  return config.id;
};
