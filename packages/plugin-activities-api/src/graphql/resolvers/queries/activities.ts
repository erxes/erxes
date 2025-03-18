import { paginate } from "@erxes/api-utils/src";
import { IContext } from "../../../connectionResolver";

const generateFilter = async (
  subdomain: string,
  params,
  commonQuerySelector,
  models
) => {
  const filter: any = commonQuerySelector;

  if (params.categoryId) {
    filter.categoryId = params.categoryId;
  }

  if (params.searchValue) {
    filter.searchText = { $in: [new RegExp(`.*${params.searchValue}.*`, "i")] };
  }

  if (params.statuses) {
    filter.status = { $in: params.statuses };
  }

  if (params.ids) {
    filter._id = { $in: params.ids };
  }

  return filter;
};

export const sortBuilder = (params) => {
  const sortField = params.sortField;
  const sortDirection = params.sortDirection || 0;

  if (sortField) {
    return { [sortField]: sortDirection };
  }

  return {};
};

const activityQueries = {
  activities: async (
    _root,
    params,
    { subdomain, commonQuerySelector, models }: IContext
  ) => {
    const filter = await generateFilter(
      subdomain,
      params,
      commonQuerySelector,
      models
    );

    return {
      list: await paginate(
        models.Activities.find(filter).sort(sortBuilder(params)),
        {
          page: params.page,
          perPage: params.perPage,
        }
      ),
      totalCount: await models.Activities.find(filter).countDocuments(),
    };
  },

  activityDetail: async (_root, { _id }, { models }: IContext) => {
    return models.Activities.getActivity(_id);
  },

  activityCategories: async (
    _root,
    { parentId, searchValue },
    { commonQuerySelector, models }: IContext
  ) => {
    const filter: any = commonQuerySelector;

    if (parentId) {
      filter.parentId = parentId;
    }

    if (searchValue) {
      filter.name = new RegExp(`.*${searchValue}.*`, "i");
    }

    return models.ActivityCategories.find(filter).sort({ order: 1 });
  },

  activityCategoriesTotalCount: async (_root, _param, { models }: IContext) => {
    return models.ActivityCategories.find().countDocuments();
  },
};

export default activityQueries;
