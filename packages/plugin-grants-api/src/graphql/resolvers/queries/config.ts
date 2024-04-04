import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../../connectionResolver';
import { checkConfig } from '../../../utils';

const GrantConfigsQueries = {
  async grantConfigs(_root, args, { models }: IContext) {
    return paginate(models.Configs.find(), args);
  },
  async grantConfigsTotalCount(_root, args, { models }: IContext) {
    return models.Configs.countDocuments();
  },
  async checkGrantActionConfig(_root, args, { subdomain }: IContext) {
    return !!(await checkConfig({ ...args, subdomain }));
  }
};

export default GrantConfigsQueries;
