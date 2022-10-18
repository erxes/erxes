import {
  checkPermission,
  requireLogin
} from '@erxes/api-utils/src/permissions';
import { IContext } from '../../../connectionResolver';
import {
  IRemainderParams,
  IRemainderProductsParams,
  IRemaindersParams
} from '../../../models/definitions/remainders';

const remainderQueries = {
  remainders: async (
    _root: any,
    params: IRemaindersParams,
    { models, subdomain }: IContext
  ) => {
    return await models.Remainders.getRemainders(subdomain, params);
  },

  remainderDetail: async (
    _root: any,
    { _id }: { _id: string },
    { models }: IContext
  ) => {
    return await models.Remainders.getRemainder(_id);
  },

  remainderCount: async (
    _root: any,
    params: IRemainderParams,
    { models, subdomain }: IContext
  ) => {
    return await models.Remainders.getRemainderCount(subdomain, params);
  },

  remainderProducts: async (
    _root: any,
    params: IRemainderProductsParams,
    { models, subdomain }: IContext
  ) => {
    return await models.Remainders.getRemainderProducts(subdomain, params);
  }
};

requireLogin(remainderQueries, 'tagDetail');
checkPermission(remainderQueries, 'remainders', 'showTags', []);

export default remainderQueries;
