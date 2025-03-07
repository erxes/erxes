import { checkPermission, paginate, requireLogin } from "@erxes/api-utils/src";
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

  if (params.ids) {
    filter._id = { $in: params.ids };
  }

  return filter;
};

const curriculumQueries = {
  curriculums: async (
    _root,
    params,
    { subdomain, commonQuerySelector, models }: IContext
  ) => {
    return paginate(
      models.Curriculum.find(
        await generateFilter(subdomain, params, commonQuerySelector, models)
      ),
      {
        page: params.page,
        perPage: params.perPage,
      }
    );
  },

  curriculumDetail: async (_root, { _id }, { models }: IContext) => {
    return models.Curriculum.getCurriculum(_id);
  },

  curriculumCategories: async (
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

    return models.CurriculumCategories.find(filter).sort({ order: 1 });
  },

  curriculumCategoriesTotalCount: async (
    _root,
    _param,
    { models }: IContext
  ) => {
    return models.CurriculumCategories.find().countDocuments();
  },
};

requireLogin(curriculumQueries, "curriculumDetail");

checkPermission(curriculumQueries, "curriculum", "showCurriculum", []);

export default curriculumQueries;
