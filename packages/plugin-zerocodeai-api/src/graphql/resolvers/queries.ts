import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';
import { IContext } from '../../connectionResolver';

const queries = {
  async zerocodeaiGetConfig(_root, _args, { models }: IContext) {
    return models.Configs.findOne({});
  },

  async zerocodeaiTranings(_root, _args, { models }: IContext) {
    return models.Trainings.find({});
  }
};

moduleRequireLogin(queries);

export default queries;
