import { IContext } from '../../../connectionResolver';
import { sendCommonMessage } from '../../../messageBroker';

const mutations = {
  mobiContractsCreate: async (
    _root,
    { ticketId }: { ticketId: string },
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

    let buildingId;
    let customerId;
    let productIds;
    let documentId;

    const cd = ticket.customFieldsData || [];

    for (const item of cd) {
      const field = await sendCommonMessage({
        subdomain,
        serviceName: 'forms',
        isRPC: true,
        action: 'fields.findOne',
        data: { query: { _id: item.field } }
      });

      if (field.code === 'buildingId') {
        buildingId = item.value;
        continue;
      }

      if (field.code === 'customerId') {
        customerId = item.value;
        continue;
      }

      if (field.code === 'productIds') {
        productIds = item.value;
        continue;
      }

      if (field.code === 'documentId') {
        documentId = item.value;
        continue;
      }
    }

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
      documentId: document._id
    });
  }
};

export default mutations;
