import { Activities, Types } from "../../models";
import { IContext } from "@erxes/api-utils/src/types"

const activityQueries = {
  activities(
    _root,
    {
      typeId
    },
    _context: IContext
  ) {

    const selector: any = {};

    if (typeId) {
      selector.typeId = typeId;
    }

    return Activities.find(selector).sort({ order: 1, name: 1 });
  },

  activityTypes(_root, _args, _context: IContext) {
    return Types.find({});
  },

  activitiesTotalCount(_root, _args, _context: IContext) {
    return Activities.find({}).countDocuments();
  }
};

export default activityQueries;
