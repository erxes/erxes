import { sendTRPCMessage } from 'erxes-api-shared/utils';

export default {
  async customer({ customerPhone }, _context, _user) {
    if (!customerPhone) {
      return null;
    }

    // Fetch the user who sent the reply
    const customer = await sendTRPCMessage({
      pluginName: 'core',
      method: 'query',
      module: 'customers',
      action: 'findOne',
      input: {
        $or: [{ primaryPhone: customerPhone }, { phones: customerPhone }],
      },
    });

    return customer;
  },
};
