import { paginate } from "@erxes/api-utils/src";
import { IContext } from "../../../connectionResolver";

const attendancesQueries = {
  attendances: async (
    _root,
    params,
    { subdomain, commonQuerySelector, models }: IContext
  ) => {
    return {
      list: models.Attendances.find({
        classId: params.classId,
        studentId: params.studentId,
      }),
      totalCount: await models.Attendances.find().countDocuments(),
    };
  },
};

export default attendancesQueries;
