import { IContext } from '../../connectionResolver';

export default {
  async __resolveReference({ _id }, { models }: IContext) {
    return models.Posts.findOne({ _id });
  },
};
