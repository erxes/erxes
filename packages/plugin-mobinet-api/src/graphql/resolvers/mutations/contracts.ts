import { IContext } from '../../../connectionResolver';
import { sendCommonMessage } from '../../../messageBroker';
import { extractCustomFields } from '../utils';

const mutations = {
  mobiContractsCreate: async (
    _root,
    { ticketId, assetId }: { ticketId: string; assetId: string },
    { subdomain, models }: IContext
  ) => {
    const contract = await models.Contracts.findOne({ ticketId });

    if (contract) {
      throw new Error('Already converted');
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

    if (!ticket) {
      throw new Error('Ticket is required');
    }

    const {
      buildingId,
      customerId,
      productIds,
      documentId
    } = await extractCustomFields({ subdomain, ticket });

    if (!buildingId || !customerId || !productIds || !documentId) {
      throw new Error('In complete custom fields data');
    }

    const document = await sendCommonMessage({
      subdomain,
      serviceName: 'documents',
      isRPC: true,
      action: 'findOne',
      data: {
        _id: documentId
      }
    });

    if (!document) {
      throw new Error('Document code is required');
    }

    return models.Contracts.createContract({
      ticketId: ticket._id,
      buildingId,
      customerId,
      productIds,
      buildingAssetId: assetId,
      documentId: document._id
    });
  }
};

export default mutations;
