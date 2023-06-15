import { IContext } from '../../connectionResolver';

export default {
  __resolveReference({ _id }, { models }: IContext) {
    return models.Schedules.findOne({ _id });
  },
  async schedules({ _id }, {}, { models }: IContext) {
    return await models.Schedules.find({ planId: _id });
  }
};
