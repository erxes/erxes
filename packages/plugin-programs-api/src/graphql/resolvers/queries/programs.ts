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

const programQueries = {
  programs: async (
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
        models.Programs.find(filter).sort(sortBuilder(params)),
        {
          page: params.page,
          perPage: params.perPage,
        }
      ),
      totalCount: await models.Programs.find(filter).countDocuments(),
    };
  },

  programDetail: async (_root, { _id }, { models }: IContext) => {
    return models.Programs.getProgram(_id);
  },

  programCategories: async (
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

    return models.ProgramCategories.find(filter).sort({ order: 1 });
  },

  programCategoriesTotalCount: async (_root, _param, { models }: IContext) => {
    return models.ProgramCategories.find().countDocuments();
  },
};

// requireLogin(programQueries, "programDetail");

// checkPermission(programQueries, "program", "showProgram", []);

export default programQueries;
