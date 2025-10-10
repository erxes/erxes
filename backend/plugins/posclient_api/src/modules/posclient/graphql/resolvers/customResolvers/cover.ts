import { IContext } from '@/posclient/@types/types';
import { ICover } from '~/modules/posclient/@types/cover';

export default {
  async user(order: ICover, _params, { models }: IContext) {
    return models.PosUsers.findOne({ _id: order.userId });
  },

  async createdUser(order: ICover, _params, { models }: IContext) {
    return models.PosUsers.findOne({ _id: order.createdBy });
  },

  async modifiedUser(order: ICover, _params, { models }: IContext) {
    return models.PosUsers.findOne({ _id: order.modifiedBy });
  },
};
