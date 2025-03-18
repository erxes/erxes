import { paginate } from "@erxes/api-utils/src";
import { IContext } from "../../../connectionResolver";

const classesQueries = {
  activityClasses: async (
    _root,
    params,
    { subdomain, commonQuerySelector, models }: IContext
  ) => {
    return {
      list: await models.Classes.find({
        _id: params.classId,
      }),
      totalCount: await models.Classes.find().countDocuments(),
    };
  },
};

export default classesQueries;
