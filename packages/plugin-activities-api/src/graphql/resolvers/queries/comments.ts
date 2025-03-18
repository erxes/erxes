import { paginate } from "@erxes/api-utils/src";
import { IContext } from "../../../connectionResolver";

const activityCommentQueries = {
  activityComments: async (
    _root,
    params,
    { subdomain, commonQuerySelector, models }: IContext
  ) => {
    return {
      list: await paginate(models.Comments.find().sort(), {
        page: params.page,
        perPage: params.perPage,
      }),
      totalCount: await models.Comments.find().countDocuments(),
    };
  },

  activityCommentCount: async (_root, { _id }, { models }: IContext) => {
    return models.Comments.find(_id).countDocuments();
  },
};

export default activityCommentQueries;
