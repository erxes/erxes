import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';

import * as dotenv from 'dotenv';
import { IContext } from '../../../connectionResolver';
dotenv.config();

const configQueries = {
  /**
   * Config object
   */
  syncmanyerkhetConfigs(_root, _args, { models }: IContext) {
    return models.Configs.find({});
  },

  async syncmanyerkhetConfigsGetValue(
    _root,
    { code }: { code: string },
    { models }: IContext
  ) {
    return models.Configs.findOne({ code }).lean();
  }
};

moduleRequireLogin(configQueries);

export default configQueries;
