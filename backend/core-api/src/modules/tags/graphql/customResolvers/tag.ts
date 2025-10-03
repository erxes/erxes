import { IContext } from '~/connectionResolvers';

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.Tags.findOne({ _id });
  },
};
