import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../connectionResolver';

const queries = {
  async zerocodeaiGetConfig(_root, _args, { models }: IContext) {
    return models.Configs.findOne({});
  }
};

moduleRequireLogin(queries);

export default queries;
