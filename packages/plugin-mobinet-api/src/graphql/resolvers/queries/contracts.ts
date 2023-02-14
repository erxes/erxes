import { IContext } from '../../../connectionResolver';
import { sendCommonMessage } from '../../../messageBroker';
import { extractCustomFields } from '../utils';

const queries = {
  mobiContracts: async (
    _root,
    { customerId }: { customerId: string },
    { models }: IContext
  ) => {
    return models.Contracts.find({ customerId });
  },

  mobiContractsGetByTicket: async (
    _root,
    { ticketId }: { ticketId: string },
    { subdomain, models }: IContext
  ) => {
    const contract = await models.Contracts.findOne({ ticketId });

    if (contract) {
      return { contract };
    }

    const ticket = await sendCommonMessage({
      subdomain,
      serviceName: 'cards',
      isRPC: true,
      action: 'tickets.findOne',
      data: {
        _id: ticketId
      }
    });

    const { buildingId } = await extractCustomFields({ subdomain, ticket });

    const building = await models.Buildings.findOne({ _id: buildingId });

    if (!building) {
      return {};
    }

    const assets = await sendCommonMessage({
      subdomain,
      serviceName: 'assets',
      action: 'assets.find',
      isRPC: true,
      data: {
        _id: { $in: building.assetIds || [] }
      }
    });

    return { assets };
  }
};

export default queries;
