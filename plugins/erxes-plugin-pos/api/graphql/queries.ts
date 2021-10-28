export const paginate = (
  collection,
  params: {
    ids?: string[];
    page?: number;
    perPage?: number;
    excludeIds?: boolean;
  }
) => {
  const { page = 0, perPage = 0, ids, excludeIds } = params || { ids: null };

  const _page = Number(page || "1");
  const _limit = Number(perPage || "20");

  if (ids && ids.length > 0) {
    return excludeIds ? collection.limit(_limit) : collection;
  }

  return collection.limit(_limit).skip((_page - 1) * _limit);
};

const generateFilterQuery = async (
  models,
  { brandId, tag, status },
  commonQuerySelector
) => {
  const query: any = commonQuerySelector;
  const integrationQuery: any = { kind: 'pos' };

  if (brandId) {
    integrationQuery.brandId = brandId;
  }

  if (tag) {
    const object = await models.Tags.findOne({ _id: tag });
    integrationQuery.tagIds = { $in: [tag, ...(object?.relatedIds || [])] };
  }

  if (status) {
    query.isActive = status === 'active' ? true : false;
  }

  const posIntegrations = await models.Integrations.find(integrationQuery, {
    _id: 1
  });

  query.integrationId = { $in: posIntegrations.map(e => e._id) };

  return query;
};

const queries = [
  /**
   * all pos list
   */
  {
    name: 'posList',
    handler: async (
      _root,
      params,
      { commonQuerySelector, models, checkPermission, user }
    ) => {
      await checkPermission('showPos', user);

      const query = await generateFilterQuery(
        models,
        params,
        commonQuerySelector
      );

      const posList = paginate(models.Pos.find(query), params);

      return posList;
    }
  },
  {
    name: 'posDetail',
    handler: async (_root, { _id }, { models, checkPermission, user }) => {
      await checkPermission('showPos', user);
      return await models.Pos.getPos(models, { _id });
    }
  },

  {
    name: 'productGroups',
    handler: async (
      _root,
      { posId }: { posId: string },
      { models, checkPermission, user }
    ) => {
      await checkPermission('managePos', user);
      return await models.ProductGroups.groups(models, posId);
    }
  }
];

export default queries;
