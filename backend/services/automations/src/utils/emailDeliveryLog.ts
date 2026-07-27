import { IDeliveryLogPort, sendTRPCMessage } from 'erxes-api-shared/utils';

/**
 * Backs the shared send path with core's `email_deliveries` collection. This
 * service holds no models of its own, so every write crosses tRPC — the same
 * way it reads configs.
 */
export const createDeliveryLogPort = (subdomain: string): IDeliveryLogPort => ({
  async create(input) {
    return await sendTRPCMessage({
      subdomain,
      method: 'mutation',
      pluginName: 'core',
      module: 'emailDeliveries',
      action: 'create',
      input,
    });
  },

  async update(_id, patch) {
    await sendTRPCMessage({
      subdomain,
      method: 'mutation',
      pluginName: 'core',
      module: 'emailDeliveries',
      action: 'recordHandoff',
      input: { _id, patch },
    });
  },
});
