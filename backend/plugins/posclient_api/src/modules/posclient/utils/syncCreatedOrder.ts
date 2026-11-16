import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { debugError } from '~/modules/posclient/debugError';

/**
 * An order created outside the cashier (an automation, an AI agent) is sent
 * to sales at once, unpaid, so its status can be looked up before payment.
 * Paid-only work there is keyed on paidDate and does not run for it.
 */
export const syncCreatedOrder = async ({
  subdomain,
  models,
  config,
  order,
}: {
  subdomain: string;
  models: IModels;
  config: { token?: string };
  order: { _id: string };
}) => {
  try {
    const items = await models.OrderItems.find({ orderId: order._id }).lean();

    await sendTRPCMessage({
      subdomain,
      method: 'mutation',
      pluginName: 'sales',
      module: 'pos',
      action: 'createOrUpdateOrders',
      input: {
        posToken: config.token,
        action: 'create',
        responses: [],
        order: await models.Orders.getOrder(order._id),
        items,
      },
      defaultValue: {},
    });
  } catch (e) {
    debugError(
      `Created order ${order._id} was not synced to sales: ${e.message}`,
    );
  }
};
