import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';

const generateFilter = params => {
  const filter: any = {};
  return filter;
};

const GrantRequestQueries = {
  async grantRequest(_root, args, { models }: IContext) {
    try {
      return await models.Requests.getGrantRequest(args);
    } catch (e) {
      return null;
    }
  },
  async grantRequests(_root, args, { models }: IContext) {
    const filter = generateFilter(args);

    return await paginate(models.Requests.find(filter), args);
  },

  async grantRequestsTotalCount(_root, args, { models }: IContext) {
    const filter = generateFilter(args);

    return await models.Requests.countDocuments(filter);
  },

  async getGrantRequestActions(_root, args, { models }: IContext) {
    return await models.Requests.getGrantActions();
  }
};

export default GrantRequestQueries;
