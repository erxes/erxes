import { getBranchesUtil } from '@/pos/utils';
import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import { cursorPaginate, paginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

const generateFilterQuery = async ({ isOnline, search }) => {
  const query: any = { status: { $ne: 'deleted' } };
  if (isOnline) {
    query.isOnline = isOnline === 'online';
  }

  if (search) {
    query.name = { $regex: search };
  }

  return query;
};

const queries = {
  async posEnv() {
    const { ALLOW_OFFLINE_POS } = process.env;
    return {
      ALLOW_OFFLINE_POS: [true, 'true', 'True', '1'].includes(
        ALLOW_OFFLINE_POS || '',
      ),
    };
  },

  async posList(_root, params, { models, checkPermission }: IContext) {
    await checkPermission('posRead');
    const query = await generateFilterQuery(params);
    const posList = paginate(models.Pos.find(query), params);
    return posList;
  },

  async salesGlobalSearchPos(
    _root,
    params: ICursorPaginateParams & { searchValue?: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('posRead');

    const searchValue = params.searchValue?.trim();
    const escapedSearchValue = searchValue?.replace(
      /[.*+?^${}()|[\]\\]/g,
      String.raw`\$&`,
    );

    return cursorPaginate({
      model: models.Pos,
      params: {
        ...params,
        orderBy: { name: 1 },
      },
      query: {
        status: { $ne: 'deleted' },
        ...(escapedSearchValue
          ? { name: { $regex: escapedSearchValue, $options: 'i' } }
          : {}),
      },
    });
  },

  async posDetail(_root, { _id }, { models, checkPermission }: IContext) {
    await checkPermission('posRead');
    return await models.Pos.getPos({ $or: [{ _id }, { token: _id }] });
  },

  async ecommerceGetBranches(
    _root,
    { posToken },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission('posRead');
    return await getBranchesUtil(subdomain, models, posToken);
  },

  async productGroups(
    _root,
    { posId }: { posId: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('posRead');
    return await models.ProductGroups.groups(posId);
  },

  async posSlots(
    _root,
    { posId }: { posId: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission('posRead');
    return await models.PosSlots.find({ posId }).lean();
  },
};

export default queries;
