import { IContext } from '../../../connectionResolver';

const GrantRequestMutations = {
  async addGrantRequest(_root, args, { models }: IContext) {
    return await models.Requests.addGrantRequest(args);
  }
};

export default GrantRequestMutations;
