import { IContext } from '../../../connectionResolver';

const GrantRequestQueries = {
  async grantRequest(_root, args, { models }: IContext) {
    return;
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
