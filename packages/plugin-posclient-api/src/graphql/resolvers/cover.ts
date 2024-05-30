import { IContext } from '../../connectionResolver';
import { ICover } from '../../models/definitions/covers';

export default {
  async user(order: ICover, {}, { models }: IContext) {
    return models.PosUsers.findOne({ _id: order.userId });
  },

  async createdUser(order: ICover, {}, { models }: IContext) {
    return models.PosUsers.findOne({ _id: order.createdBy });
  },

  async modifiedUser(order: ICover, {}, { models }: IContext) {
    return models.PosUsers.findOne({ _id: order.modifiedBy });
  }
};
