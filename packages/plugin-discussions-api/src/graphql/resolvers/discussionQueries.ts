import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../connectionResolver';

const discussionQueries = {
  async discussions(_root, { limit }: { limit: number }, { models }: IContext) {
    const sort = { date: -1 };

    const selector: any = {};

    if (limit) {
      return models.Discussions.find(selector)
        .sort(sort as any)
        .limit(limit);
    }

    return paginate(models.Discussions.find(selector), {}).sort(sort);
  },

  async discussionsDetail(_root, { _id }, { models }: IContext) {
    return models.Discussions.findOne({ _id });
  }
};

export default discussionQueries;
