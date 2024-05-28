import { sendCardsMessage, sendCoreMessage } from '../../messageBroker';

const aputpmQueries = {
  async removeDevations(_root, { _id }, { subdomain }) {
    const ticket = await sendCardsMessage({
      subdomain,
      action: 'tickets.findOne',
      data: { _id },
      isRPC: true,
      defaultValue: null,
    });

    if (!ticket) {
      throw new Error('Not found devation');
    }

    const relIds = await sendCoreMessage({
      subdomain,
      action: 'conformities.savedConformity',
      data: {
        mainType: 'ticket',
        mainTypeId: _id,
        relTypes: ['task'],
      },
      isRPC: true,
      defaultValue: [],
    });

    await sendCardsMessage({
      subdomain,
      action: 'tasks.remove',
      data: { _ids: relIds },
      isRPC: true,
    }).catch((error) => {
      throw new Error(error);
    });

    await sendCardsMessage({
      subdomain,
      action: 'tickets.remove',
      data: { _ids: [ticket._id] },
      isRPC: true,
    }).catch((error) => {
      throw new Error(error);
    });

    return { staus: 'success' };
  },
};

export default aputpmQueries;
