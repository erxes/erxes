import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../connectionResolver';

const discussionQueries = {
  discussions(_root, { limit }: { limit: number }, { models }: IContext) {
    const sort = { date: -1 };

    const selector: any = {};

    if (limit) {
      return models.Discussions.find(selector)
        .sort(sort)
        .limit(limit);
    }

    return paginate(models.Discussions.find(selector), {}).sort(sort);
  },

  discussionsDetail(_root, { _id }, { models }: IContext) {
    return models.Discussions.findOne({ _id });
  }
};

export default discussionQueries;
