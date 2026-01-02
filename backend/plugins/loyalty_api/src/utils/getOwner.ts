import { sendTRPCMessage } from 'erxes-api-shared/utils';

export const getLoyaltyOwner = async (
  subdomain: string,
  { ownerType, ownerId }: { ownerType: string; ownerId: string },
) => {
  switch (ownerType) {
    case 'user':
      return await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'query',
        module: 'users',
        action: 'findOne',
        input: {
          query: {
            _id: ownerId,
          },
        },
      });
    case 'customer':
      return await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'query',
        module: 'customers',
        action: 'findOne',
        input: {
          query: {
            _id: ownerId,
          },
        },
      });
    case 'company':
      return await sendTRPCMessage({
        subdomain,
        pluginName: 'core',
        method: 'query',
        module: 'companies',
        action: 'findOne',
        input: {
          query: {
            _id: ownerId,
          },
        },
      });
    case 'cpUser':
      return await sendTRPCMessage({
        subdomain,
        pluginName: 'content',
        method: 'query',
        module: 'portalUser',
        action: 'findOne',
        input: { _id: ownerId },
      });
    default:
      return {};
  }
};
