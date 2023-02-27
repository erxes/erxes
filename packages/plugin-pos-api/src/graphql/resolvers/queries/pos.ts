import { checkPermission } from '@erxes/api-utils/src/permissions';
import { getBranchesUtil } from '../../../utils';
import { IContext } from '../../../connectionResolver';
import { paginate } from '@erxes/api-utils/src/core';

const generateFilterQuery = async ({ isOnline }, commonQuerySelector) => {
  const query: any = commonQuerySelector;
  if (isOnline) {
    query.isOnline = isOnline === 'online';
  }

  return query;
};

const queries = {
  posEnv: async (_root, _args, {}: IContext) => {
    const { ALL_AUTO_INIT } = process.env;
    return {
      ALL_AUTO_INIT: [true, 'true', 'True', '1'].includes(ALL_AUTO_INIT || '')
    };
  },

  posList: async (_root, params, { commonQuerySelector, models }) => {
    const query = await generateFilterQuery(params, commonQuerySelector);

    const posList = paginate(models.Pos.find(query), params);

    return posList;
  },

  posDetail: async (_root, { _id }, { models }) => {
    return await models.Pos.getPos({ $or: [{ _id }, { token: _id }] });
  },

  ecommerceGetBranches: async (
    _root,
    { posToken },
    { models, subdomain }: IContext
  ) => {
    return await getBranchesUtil(subdomain, models, posToken);
  },

  productGroups: async (
    _root,
    { posId }: { posId: string },
    { models }: IContext
  ) => {
    return await models.ProductGroups.groups(posId);
  },

  posSlots: async (
    _root,
    { posId }: { posId: string },
    { models }: IContext
  ) => {
    return await models.PosSlots.find({ posId }).lean();
  }
};

checkPermission(queries, 'posList', 'showPos');
checkPermission(queries, 'posDetail', 'showPos');
checkPermission(queries, 'productGroups', 'managePos');

export default queries;
