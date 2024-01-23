import { IContext } from '../../../connectionResolver';
import { sendKbMessage } from '../../../messageBroker';

export default {
  __resolveReference({ _id }, { models, subdomain }: IContext) {
    return sendKbMessage({
      subdomain,
      action: 'categories.findOne',
      data: { query: { _id } },
      isRPC: true,
      defaultValue: null
    });
  },

  async articles({ _id }, {}, { subdomain }: IContext) {
    return await sendKbMessage({
      subdomain,
      action: 'articles.find',
      data: {
        query: {
          categoryId: _id,
          status: { $in: ['draft', 'publish'] }
        },
        sort: {
          createdDate: -1
        }
      },
      isRPC: true,
      defaultValue: []
    });
  }
};
