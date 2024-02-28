import * as dotenv from 'dotenv';
import { IContext } from '../../../connectionResolver';
dotenv.config();

const configQueries = {
  /**
   * AccountingsConfig object
   */
  accountingsConfigs(_root, _args, { models }: IContext) {
    return models.AccountingsConfigs.find({});
  },
};

// moduleRequireLogin(configQueries);

export default configQueries;
