import { paginate } from '@erxes/api-utils/src/core';
import { IContext } from '../../../connectionResolver';

const coverQueries = {
  async posCovers(_root, params, { models }: IContext) {
    return paginate(
      models.Covers.find({})
        .sort({ createdAt: -1 })
        .lean(),
      {
        ...params
      }
    );
  },

  async posCoverDetail(_root, { _id }: { _id: string }, { models }: IContext) {
    return models.Covers.getCover(_id);
  }
};

export default coverQueries;
