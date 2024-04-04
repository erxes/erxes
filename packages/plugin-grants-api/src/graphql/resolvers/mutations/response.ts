import { IContext } from '../../../connectionResolver';

const GrantResponsesMutations = {
  async responseGrantRequest(_root, args, { models, user }: IContext) {
    return await models.Responses.responseGrantRequest(args, user);
  }
};

export default GrantResponsesMutations;
