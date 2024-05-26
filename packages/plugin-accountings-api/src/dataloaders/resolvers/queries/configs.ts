import * as dotenv from 'dotenv';
import { IContext } from '../../../connectionResolver';
import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';

dotenv.config();

const configQueries = {
  /**
   * AccountingConfig object
   */
  accountingConfigs(_root, _args, { models }: IContext) {
    return models.AccountingConfigs.find({});
  },
};

moduleRequireLogin(configQueries);

export default configQueries;
