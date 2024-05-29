import { IContext } from '../../connectionResolver';
import { ICover } from '../../models/definitions/covers';

export default {
  user(order: ICover, {}, { models }: IContext) {
    return models.PosUsers.findOne({ _id: order.userId });
  },

  createdUser(order: ICover, {}, { models }: IContext) {
    return models.PosUsers.findOne({ _id: order.createdBy });
  },

  modifiedUser(order: ICover, {}, { models }: IContext) {
    return models.PosUsers.findOne({ _id: order.modifiedBy });
  }
};
