import { getBranchesUtil } from "@/pos/utils";
import { paginate } from "erxes-api-shared/utils";
import { IContext } from "~/connectionResolvers";

const generateFilterQuery = async ({ isOnline }) => {
  const query: any = { status: { $ne: 'deleted' } };
  if (isOnline) {
    query.isOnline = isOnline === 'online';
  }

  return query;
};

const queries = {
  async posEnv() {
    const { ALL_AUTO_INIT } = process.env;
    return {
      ALL_AUTO_INIT: [true, 'true', 'True', '1'].includes(ALL_AUTO_INIT || '')
    };
  },

  async posList(_root, params, { models }: IContext) {
    const query = await generateFilterQuery(params);

    const posList = paginate(models.Pos.find(query), params);

    return posList;
  },

  async posDetail(_root, { _id }, { models }: IContext) {
    return await models.Pos.getPos({ $or: [{ _id }, { token: _id }] });
  },

  async ecommerceGetBranches(
    _root,
    { posToken },
    { models, subdomain }: IContext
  ) {
    return await getBranchesUtil(subdomain, models, posToken);
  },

  async productGroups(
    _root,
    { posId }: { posId: string },
    { models }: IContext
  ) {
    return await models.ProductGroups.groups(posId);
  },

  async posSlots(
    _root,
    { posId }: { posId: string },
    { models }: IContext
  ) {
    return await models.PosSlots.find({ posId }).lean();
  }
};

// checkPermission(queries, 'posList', 'showPos');
// checkPermission(queries, 'posDetail', 'showPos');
// checkPermission(queries, 'productGroups', 'managePos');

export default queries;
