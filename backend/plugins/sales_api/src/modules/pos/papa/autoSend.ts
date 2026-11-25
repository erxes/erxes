import { IModels } from '~/connectionResolvers';
import { isPapaSize, planPapaAutoSend } from './mapping';
import {
  getPapaReferences,
  quotePapaDelivery,
  sendPapaDelivery,
} from './service';
import { IPapaAutoSend, IPosPapaConfig } from './types';

const errorText = (error: unknown) =>
  (error instanceof Error ? error.message : String(error)).slice(0, 500);

/**
 * Quotes and sends a paid delivery order to Papa as soon as it arrives, when
 * its POS has `deliveryConfig.papa.autoSend` on. Runs once per order (a
 * conditional `papaAutoSend` claim) and never throws: an order without a
 * known district, address, pin or phone is skipped, and a Papa error is
 * stored, for staff to finish on the order's Delivery tab.
 */
export const autoSendPapaDelivery = async ({
  subdomain,
  models,
  orderId,
}: {
  subdomain: string;
  models: IModels;
  orderId: string;
}) => {
  const order = await models.PosOrders.findOne({ _id: orderId }).lean().exec();

  if (
    order?.type !== 'delivery' ||
    !order.paidDate ||
    order.status === 'return' ||
    order.papaDelivery ||
    order.papaAutoSend
  ) {
    return;
  }

  const pos = await models.Pos.findOne({ token: order.posToken }).lean().exec();
  const papa: IPosPapaConfig | undefined = pos?.deliveryConfig?.papa;

  if (!papa?.enabled || !papa.autoSend) {
    return;
  }

  const claimed = await models.PosOrders.updateOne(
    {
      _id: orderId,
      papaAutoSend: { $in: [null] },
      papaDelivery: { $in: [null] },
    },
    { $set: { papaAutoSend: { status: 'sending', at: new Date() } } },
  );

  if (!claimed.modifiedCount) {
    return;
  }

  const finish = (result: Omit<IPapaAutoSend, 'at'>) =>
    models.PosOrders.updateOne(
      { _id: orderId },
      { $set: { papaAutoSend: { ...result, at: new Date() } } },
    );

  try {
    const references = await getPapaReferences(models);
    const plan = planPapaAutoSend(
      order.deliveryInfo,
      Array.isArray(references.locations) ? references.locations : [],
      isPapaSize(papa.size) ? papa.size : undefined,
    );

    if (!plan.quote || !plan.send.receiverPhone) {
      await finish({ status: 'skipped', missing: plan.missing });
      return;
    }

    await quotePapaDelivery(models, orderId, plan.quote);
    await sendPapaDelivery(models, subdomain, orderId, plan.send);
    await finish({ status: 'sent' });
  } catch (error) {
    await finish({ status: 'failed', error: errorText(error) }).catch(
      () => undefined,
    );
  }
};
