import { IDeliveryLogPort, sendTRPCMessage } from 'erxes-api-shared/utils';

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
