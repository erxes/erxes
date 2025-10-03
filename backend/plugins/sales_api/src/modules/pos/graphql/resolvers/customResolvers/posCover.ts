import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { ICover } from '~/modules/pos/@types/covers';

export default {
  async user(cover: ICover) {
    if (!cover.userId) {
      return null;
    }

    return await sendTRPCMessage({
      pluginName: 'core',
      module: 'users',
      action: 'users.findOne',
      input: { _id: cover.userId },
    });
  },

  async createdUser(cover: ICover) {
    if (!cover.createdBy) {
      return null;
    }
    return sendTRPCMessage({
      pluginName: 'core',
      module: 'users',
      action: 'findOne',
      input: { _id: cover.createdBy },
    });
  },

  async modifiedUser(cover: ICover) {
    if (!cover.modifiedBy) {
      return null;
    }
    return sendTRPCMessage({
      pluginName: 'core',
      module: 'users',
      action: 'findOne',
      input: { _id: cover.modifiedBy },
    });
  },

  posName: async (cover, _, { models }) => {
    const pos = await models.Pos.findOne({ token: cover.posToken }).lean();
    return pos ? pos.name : '';
  }
};
