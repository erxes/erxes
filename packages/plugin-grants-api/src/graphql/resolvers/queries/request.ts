import { IContext } from '../../../connectionResolver';

const GrantRequestQueries = {
  async grantRequest(_root, args, { models }: IContext) {
    try {
      return await models.Requests.getGrantRequest(args);
    } catch (e) {
      return null;
    }
  },
  grantRequests(_root, args, {}: IContext) {
    return [];
  },

  grantRequestsTotalCount(_root, args, {}: IContext) {
    return 0;
  },

  async getGrantRequestActions(_root, args, { models }: IContext) {
    return await models.Requests.getGrantActions();
  }
};

export default GrantRequestQueries;
