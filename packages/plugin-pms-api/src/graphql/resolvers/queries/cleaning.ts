import { requireLogin } from '@erxes/api-utils/src/permissions';

import * as dotenv from 'dotenv';
import { IContext } from '../../../connectionResolver';
import { sendProductsMessage, sendSalesMessage } from '../../../messageBroker';

dotenv.config();

const cleaningQueries = {
  async pmsCleanings(_root, _args, { models }: IContext) {
    return models.Cleaning.find({});
  },
};

// requireLogin(configQueries, 'pmsConfigs');

export default cleaningQueries;
