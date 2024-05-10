import * as dotenv from 'dotenv';
import { IContext } from '../../../connectionResolver';
dotenv.config();

const configQueries = {
  /**
   * AccountingConfig object
   */
  accountingConfigs(_root, _args, { models }: IContext) {
    return models.AccountingConfigs.find({});
  },
};

// moduleRequireLogin(configQueries);

export default configQueries;
