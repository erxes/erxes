import { requireLogin } from '@erxes/api-utils/src/permissions';

import * as dotenv from 'dotenv';
import { IContext } from '../../../connectionResolver';
import { sendProductsMessage, sendSalesMessage } from '../../../messageBroker';

dotenv.config();

const cleaningQueries = {
  async pmsCleanings(_root, _args, { models }: IContext) {
    return models.Cleaning.find({});
  },

  async pmsCleaningsHistory(
    _root,
    { roomIds }: { roomIds: string[] },
    { models }: IContext
  ) {
    return models.History.find({ roomId: { $in: roomIds || [] } });
  },
};

// requireLogin(configQueries, 'pmsConfigs');

export default cleaningQueries;
