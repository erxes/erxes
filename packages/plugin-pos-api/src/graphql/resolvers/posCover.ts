import { IContext } from '../../connectionResolver';
import { sendCoreMessage } from '../../messageBroker';
import { ICover } from '../../models/definitions/covers';

export default {
  async user(cover: ICover, {}, { subdomain }: IContext) {
    if (!cover.userId) {
      return null;
    }
    return sendCoreMessage({
      subdomain,
      action: 'users.findOne',
      data: { _id: cover.userId },
      isRPC: true
    });
  },

  async createdUser(cover: ICover, {}, { subdomain }: IContext) {
    if (!cover.createdBy) {
      return null;
    }
    return sendCoreMessage({
      subdomain,
      action: 'users.findOne',
      data: { _id: cover.createdBy },
      isRPC: true
    });
  },

  async modifiedUser(cover: ICover, {}, { subdomain }: IContext) {
    if (!cover.modifiedBy) {
      return null;
    }
    return sendCoreMessage({
      subdomain,
      action: 'users.findOne',
      data: { _id: cover.modifiedBy },
      isRPC: true
    });
  },
  posName: async (cover, {}, { models }) => {
    const pos = await models.Pos.findOne({ token: cover.posToken }).lean();
    return pos ? pos.name : '';
  }
};
