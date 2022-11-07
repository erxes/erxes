import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';

const safeRemainderQueries = {
  safeRemainders: async (_root: any, params: any, { models }: IContext) => {
    return await models.SafeRemainders.getRemainders(params);
  },

  safeRemainderDetail: async (
    _root: any,
    { _id }: { _id: string },
    { models }: IContext
  ) => {
    return await models.SafeRemainders.getRemainder(_id);
  }
};

requireLogin(safeRemainderQueries, 'tagDetail');
checkPermission(safeRemainderQueries, 'remainders', 'showTags', []);

export default safeRemainderQueries;
